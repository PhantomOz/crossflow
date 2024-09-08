'use client';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { useSwitchNetwork, useWeb3Modal, useWeb3ModalAccount } from "@web3modal/ethers/react"
import { useEffect, useState } from "react"
import { CCIPChainSelector, chainAddress, chainCurrency, MultiChainTokenAddress, ToChain, toChainSelector, useBridge } from "@/hooks/useBridge";

export function Bridge() {
  const { switchNetwork } = useSwitchNetwork();
  const { open } = useWeb3Modal();
  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const [toAddress, setToAddress] = useState<`0x${string}` | undefined>();
  const [token, setToken] = useState<string>();
  const [toChains, setToChains] = useState<ToChain[]>([]);
  const [amount, setAmount] = useState<number>();
  const [payFeesIn, setPayFeeIn] = useState('0');
  const [tokens, setTokens] = useState<string[]>([]);
  const [toNetwork, setToNetwork] = useState({ id: '84532', name: 'Base Sepolia' });
  const [networkName, setNetworkName] = useState('Ethereum Sepolia');
  const { sendToken, getFee } = useBridge();

  useEffect(() => {
    setToAddress(address);
  }, [isConnected]);

  useEffect(() => {
    const chainSelector = toChainSelector[chainId as number];
    setToChains(chainSelector)
    if (chainSelector) {

      setToNetwork({ id: chainSelector[0].id, name: chainSelector[0].name });
      setTokens(chainCurrency[chainId as number]);
      setToken(chainCurrency[chainId as number][0]);
    }
  }, [isConnected, chainId]);

  const handleFromNetworkChange = (e: string, name: string) => {
    switchNetwork(Number(e));
    setNetworkName(name);
  };
  const handleToNetworkChange = (e: string, name: string) => {
    setToNetwork({ id: e, name: name });
    setTokens(chainCurrency[e]);
  };

  const handleTokenChange = (e: string) => {
    setToken(e);
  };

  const handleSendToken = async (e: any) => {
    e.preventDefault();
    await sendToken(CCIPChainSelector[toNetwork.id], toAddress as `0x${string}`, MultiChainTokenAddress[toNetwork.id][token as string].address, Number(amount), 3, 0, token as string)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background border-b px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <CrossIcon className="h-6 w-6" />
          <span className="font-semibold text-lg">CrossFlow</span>
        </Link>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <EthIcon className="h-4 w-4" />
                <span>{networkName}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleFromNetworkChange('11155111', 'Ethereum Sepolia')}>Ethereum Sepolia</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFromNetworkChange('84532', 'Base Sepolia')}>Base Sepolia</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {isConnected ? <w3m-button />
            : <Button variant="outline" onClick={() => open()}>
              <WalletIcon className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>}
        </div>
      </header>
      <main className="flex-1 bg-muted/40 py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bridge Tokens</CardTitle>
              <CardDescription>Transfer tokens between different blockchains.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="from-chain">From</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full flex items-center justify-between">
                          <span>{networkName}</span>
                          <ChevronDownIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleFromNetworkChange('11155111', 'Ethereum Sepolia')}>Ethereum Sepolia</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFromNetworkChange('84532', 'Base Sepolia')}>Base Sepolia</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="to-chain">To</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full flex items-center justify-between">
                          <span>{toNetwork.name}</span>
                          <ChevronDownIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {/* <DropdownMenuItem>Ethereum Sepolia</DropdownMenuItem>
                        <DropdownMenuItem>Base Sepolia</DropdownMenuItem> */}
                        {toChains?.map((chain: any, index: any) => <DropdownMenuItem key={index} onClick={() => handleToNetworkChange(chain.id, chain.name)} >{chain.name}</DropdownMenuItem>)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="token">Token</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full w-6 h-6 text-primary-foreground flex items-center justify-center">
                            {tokenLogo[token as string]}
                          </div>
                          <span>{token}</span>
                        </div>
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {tokens?.map((token: any, index: any) => <DropdownMenuItem key={index} onClick={() => handleTokenChange(token)}>
                        <div className="flex items-center gap-2">
                          <div className="rounded-full w-6 h-6 text-primary-foreground flex items-center justify-center">
                            {tokenLogo[token]}
                          </div>
                          <span>{token}</span>
                        </div>
                      </DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" placeholder="0.0" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">To</Label>
                  <Input id="address" type="text" placeholder="0x43hgdsy37...7c7" value={toAddress} onChange={(e) => setToAddress(e.target.value as `0x${string}`)} />
                </div>
                <Button className="w-full" onClick={handleSendToken} disabled={!isConnected || (amount as number <= 0 || amount === undefined)}>{!isConnected ? "Connect Wallet" : (amount as number <= 0 || amount === undefined) ? "Enter Amount" : "Bridge Tokens"}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <ActivityIcon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Activity</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
            <ActivityIcon className="h-5 w-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Activity</DrawerTitle>
            <DrawerDescription>View all your recent token bridge transactions.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-6 space-y-4">
            {/* <Card>
              <CardHeader>
                <CardTitle>Bridged 0.000034 ETH to Base Sepolia</CardTitle>
                <CardDescription>
                  <time dateTime="2024-09-08">September 8, 2024</time>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">From</div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full w-6 h-6 text-primary-foreground flex items-center justify-center">
                        {tokenLogo['ETH']}
                      </div>
                      <span>Ethereum</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">To</div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full w-6 h-6 bg-accent text-accent-foreground flex items-center justify-center">
                        <EthIcon />
                      </div>
                      <span>Base Sepolia</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="font-medium">0.000034 ETH</div>
                </div>
              </CardFooter>
            </Card> */}
            <p className="text-center">No Activity</p>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  )
}


function DaiIcon(props: any) {
  return (
    <svg {...props} width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0zm-.171 8H9.277v5.194H7v1.861h2.277v1.953H7v1.86h2.277V24h6.552c3.94 0 6.938-2.095 8.091-5.131H26v-1.86h-1.624c.04-.33.06-.668.06-1.01v-.046c0-.304-.016-.604-.047-.898H26v-1.86h-2.041C22.835 10.114 19.814 8 15.829 8zm6.084 10.869c-1.007 2.075-3.171 3.462-6.084 3.462h-4.72v-3.462zm.564-3.814c.042.307.064.622.064.944v.045c0 .329-.023.65-.067.964H11.108v-1.953h11.37zM15.83 9.666c2.926 0 5.097 1.424 6.098 3.528h-10.82V9.666h4.72z" /></svg>
  )
}

function LinkIcon(props: any) {
  return (
    <svg {...props} width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0zm0 6l-1.799 1.055L9.3 9.945 7.5 11v10l1.799 1.055 4.947 2.89L16.045 26l1.799-1.055 4.857-2.89L24.5 21V11l-1.799-1.055-4.902-2.89L16 6zm0 4.22l4.902 2.89v5.78L16 21.78l-4.902-2.89v-5.78L16 10.22z" /></svg>)
}

function UsdcIcon(props: any) {
  return (
    <svg {...props} width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0zm3.352 5.56c-.244-.12-.488 0-.548.243-.061.061-.061.122-.061.243v.85l.01.104a.86.86 0 00.355.503c4.754 1.7 7.192 6.98 5.424 11.653-.914 2.55-2.925 4.491-5.424 5.402-.244.121-.365.303-.365.607v.85l.005.088a.45.45 0 00.36.397c.061 0 .183 0 .244-.06a10.895 10.895 0 007.13-13.717c-1.096-3.46-3.778-6.07-7.13-7.162zm-6.46-.06c-.061 0-.183 0-.244.06a10.895 10.895 0 00-7.13 13.717c1.096 3.4 3.717 6.01 7.13 7.102.244.121.488 0 .548-.243.061-.06.061-.122.061-.243v-.85l-.01-.08c-.042-.169-.199-.362-.355-.466-4.754-1.7-7.192-6.98-5.424-11.653.914-2.55 2.925-4.491 5.424-5.402.244-.121.365-.303.365-.607v-.85l-.005-.088a.45.45 0 00-.36-.397zm3.535 3.156h-.915l-.088.008c-.2.04-.346.212-.4.478v1.396l-.207.032c-1.708.304-2.778 1.483-2.778 2.942 0 2.002 1.218 2.791 3.778 3.095 1.707.303 2.255.668 2.255 1.639 0 .97-.853 1.638-2.011 1.638-1.585 0-2.133-.667-2.316-1.578-.06-.242-.244-.364-.427-.364h-1.036l-.079.007a.413.413 0 00-.347.418v.06l.033.18c.29 1.424 1.266 2.443 3.197 2.734v1.457l.008.088c.04.198.213.344.48.397h.914l.088-.008c.2-.04.346-.212.4-.477V21.34l.207-.04c1.713-.362 2.84-1.601 2.84-3.177 0-2.124-1.28-2.852-3.84-3.156-1.829-.243-2.194-.728-2.194-1.578 0-.85.61-1.396 1.828-1.396 1.097 0 1.707.364 2.011 1.275a.458.458 0 00.427.303h.975l.079-.006a.413.413 0 00.348-.419v-.06l-.037-.173a3.04 3.04 0 00-2.706-2.316V9.142l-.008-.088c-.04-.199-.213-.345-.48-.398z" /></svg>)
}

function WethIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g fill-rule="evenodd"><path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm6.732-16L16 12.19 9.268 16 16 19.781l6.732-3.783zM16 21.047a3944.37 3944.37 0 00-7-3.952c2.079 3.248 4.66 7.26 7 10.904 2.34-3.643 4.921-7.656 7-10.904a3944.185 3944.185 0 00-7 3.952zm0-10.089l7 3.907L16 4 9 14.866l7-3.907z" /><path fill-opacity=".296" fill-rule="nonzero" d="M22.71 15.976l-6.721.577v-4.379l6.72 3.802zm-6.721 5.038c1.98-1.12 4.537-2.564 6.988-3.944-2.076 3.242-4.652 7.246-6.988 10.882v-6.938zm0-10.069V4l6.988 10.845-6.988-3.9z" /><path fill-opacity=".803" d="M15.989 16.553l6.72-.577-6.72 3.775z" /><path opacity=".311" d="M15.988 16.553l-6.721-.577 6.721 3.775z" /></g></svg>)
}

function EthIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g fill-rule="evenodd"><path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.994-15.781L16.498 4 9 16.22l7.498 4.353 7.496-4.354zM24 17.616l-7.502 4.351L9 17.617l7.498 10.378L24 17.616z" /><g fill-rule="nonzero"><path fill-opacity=".298" d="M16.498 4v8.87l7.497 3.35zm0 17.968v6.027L24 17.616z" /><path fill-opacity=".801" d="M16.498 20.573l7.497-4.353-7.497-3.348z" /><path fill-opacity=".298" d="M9 16.22l7.498 4.353v-7.701z" /></g></g></svg>
  )
}

const tokenLogo: any = {
  'DAI': <DaiIcon className="h-4 w-4" />,
  'ETH': <EthIcon className="h-4 w-4" />,
  'LINK': <LinkIcon className="h-4 w-4" />,
  'USDC': <UsdcIcon className="h-4 w-4" />,
  'WETH': <WethIcon className="h-4 w-4" />
}


function ChevronDownIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}


function CrossIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z" />
    </svg>
  )
}


function WalletIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  )
}
