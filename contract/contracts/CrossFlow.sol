// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {IAny2EVMMessageReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

contract CrossFlow is IAny2EVMMessageReceiver, OwnerIsCreator, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum PayFeesIn {
        NATIVE,
        LINK
    }

    error InvalidRouter(address router);

    IRouterClient internal immutable i_ccipRouter;
    LinkTokenInterface internal immutable i_linkToken;
    uint64 private immutable i_currentChainSelector;

    mapping(uint64 destChainSelector => xFlowDetails xFlowDetailsPerChain)
        public s_chains;

    struct xFlowDetails {
        address xFlowAddress;
    }

    modifier onlyEnabledChain(uint64 _chainSelector) {
        if (s_chains[_chainSelector].xFlowAddress == address(0))
            revert ChainNotEnabled(_chainSelector);
        _;
    }

    modifier onlyRouter() {
        if (msg.sender != address(i_ccipRouter))
            revert InvalidRouter(msg.sender);
        _;
    }

    constructor(
        address ccipRouterAddress,
        address linkTokenAddress,
        uint64 currentChainSelector
    ) {
        if (ccipRouterAddress == address(0)) revert InvalidRouter(address(0));
        i_ccipRouter = IRouterClient(ccipRouterAddress);
        i_linkToken = LinkTokenInterface(linkTokenAddress);
        i_currentChainSelector = currentChainSelector;
    }

    function crossChainTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        uint64 destinationChainSelector,
        PayFeesIn payFeesIn
    )
        external
        nonReentrant
        onlyEnabledChain(destinationChainSelector)
        returns (bytes32 messageId)
    {
        string memory tokenUri = tokenURI(tokenId);
        _burn(tokenId);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(
                s_chains[destinationChainSelector].xNftAddress
            ),
            data: abi.encode(from, to, tokenId, tokenUri),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: s_chains[destinationChainSelector].ccipExtraArgsBytes,
            feeToken: payFeesIn == PayFeesIn.LINK
                ? address(i_linkToken)
                : address(0)
        });

        // Get the fee required to send the CCIP message
        uint256 fees = i_ccipRouter.getFee(destinationChainSelector, message);

        if (payFeesIn == PayFeesIn.LINK) {
            if (fees > i_linkToken.balanceOf(address(this)))
                revert NotEnoughBalanceForFees(
                    i_linkToken.balanceOf(address(this)),
                    fees
                );

            // Approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
            i_linkToken.approve(address(i_ccipRouter), fees);

            // Send the message through the router and store the returned message ID
            messageId = i_ccipRouter.ccipSend(
                destinationChainSelector,
                message
            );
        } else {
            if (fees > address(this).balance)
                revert NotEnoughBalanceForFees(address(this).balance, fees);

            // Send the message through the router and store the returned message ID
            messageId = i_ccipRouter.ccipSend{value: fees}(
                destinationChainSelector,
                message
            );
        }

        emit CrossChainSent(
            from,
            to,
            tokenId,
            i_currentChainSelector,
            destinationChainSelector
        );
    }

    /// @inheritdoc IAny2EVMMessageReceiver
    function ccipReceive(
        Client.Any2EVMMessage calldata message
    )
        external
        virtual
        override
        onlyRouter
        nonReentrant
        onlyEnabledChain(message.sourceChainSelector)
        onlyEnabledSender(
            message.sourceChainSelector,
            abi.decode(message.sender, (address))
        )
    {
        uint64 sourceChainSelector = message.sourceChainSelector;
        (
            address from,
            address to,
            uint256 tokenId,
            string memory tokenUri
        ) = abi.decode(message.data, (address, address, uint256, string));

        emit CrossChainReceived(
            from,
            to,
            tokenId,
            sourceChainSelector,
            i_currentChainSelector
        );
    }
}
