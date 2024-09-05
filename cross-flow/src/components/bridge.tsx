'use client';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { useSwitchNetwork, useWeb3ModalAccount } from "@web3modal/ethers/react"
import { useEffect, useState } from "react"
import { chainCurrency, ToChain, toChainSelector } from "@/hooks/useBridge";

export function Bridge() {
  const { switchNetwork } = useSwitchNetwork();
  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const [toAddress, setToAddress] = useState<`0x${string}` | undefined>();
  const [token, setToken] = useState<string>();
  const [toChains, setToChains] = useState<ToChain[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [payFeesIn, setPayFeeIn] = useState('0');
  const [tokens, setTokens] = useState<string[]>([]);
  const [toNetwork, setToNetwork] = useState('84532');


  useEffect(() => {
    setToAddress(address);
  }, [isConnected]);

  useEffect(() => {
    const chainSelector = toChainSelector[chainId as number];
    setToChains(chainSelector)
    setToNetwork(chainSelector[0].id);
    setTokens(chainCurrency[chainId as number]);
  }, [isConnected, chainId]);

  const handleFromNetworkChange = (e: string) => {
    switchNetwork(Number(e));
  };
  const handleToNetworkChange = (e: string) => {
    setToNetwork(e);
    setTokens(chainCurrency[e]);
  };

  const handleTokenChange = (e: string) => {
    setToken(e);
  };

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
                <BitcoinIcon className="h-4 w-4" />
                <span>Ethereum Sepolia</span>
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ethereum Sepolia</DropdownMenuItem>
              <DropdownMenuItem>Base Sepolia</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline">
            <WalletIcon className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
          <w3m-button />
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
                          <span>Ethereum Sepolia</span>
                          <ChevronDownIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem>Ethereum Sepolia</DropdownMenuItem>
                        <DropdownMenuItem>Base Sepolia</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="to-chain">To</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full flex items-center justify-between">
                          <span>Base Sepolia</span>
                          <ChevronDownIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem>Ethereum Sepolia</DropdownMenuItem>
                        <DropdownMenuItem>Base Sepolia</DropdownMenuItem>
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
                          <div className="rounded-full w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center">
                            ETH
                          </div>
                          <span>Ethereum</span>
                        </div>
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <div className="flex items-center gap-2">
                          <div className="rounded-full w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center">
                            ETH
                          </div>
                          <span>Ethereum</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex items-center gap-2">
                          <div className="rounded-full w-6 h-6 bg-accent text-accent-foreground flex items-center justify-center">
                            DAI
                          </div>
                          <span>DAI</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex items-center gap-2">
                          <div className="rounded-full w-6 h-6 bg-success text-success-foreground flex items-center justify-center">
                            LINK
                          </div>
                          <span>LINK</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex items-center gap-2">
                          <div className="rounded-full w-6 h-6 bg-warning text-warning-foreground flex items-center justify-center">
                            WETH
                          </div>
                          <span>WETH</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" placeholder="0.0" />
                </div>
                <Button className="w-full">Bridge Tokens</Button>
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
            <Card>
              <CardHeader>
                <CardTitle>Bridged 1 ETH to Polygon</CardTitle>
                <CardDescription>
                  <time dateTime="2023-06-01">June 1, 2023</time>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">From</div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center">
                        ETH
                      </div>
                      <span>Ethereum</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">To</div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full w-6 h-6 bg-accent text-accent-foreground flex items-center justify-center">
                        MATIC
                      </div>
                      <span>Polygon</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="font-medium">1 ETH</div>
                </div>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bridged 5 MATIC to Ethereum</CardTitle>
                <CardDescription>
                  <time dateTime="2023-05-28">May 28, 2023</time>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">From</div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full w-6 h-6 bg-accent text-accent-foreground flex items-center justify-center">
                        MATIC
                      </div>
                      <span>Polygon</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">To</div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center">
                        ETH
                      </div>
                      <span>Ethereum</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="font-medium">5 MATIC</div>
                </div>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bridged 0.5 AVAX to Arbitrum</CardTitle>
                <CardDescription>
                  <time dateTime="2023-05-15">May 15, 2023</time>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">From</div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full w-6 h-6 bg-success text-success-foreground flex items-center justify-center">
                        AVAX
                      </div>
                      <span>Avalanche</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">To</div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full w-6 h-6 bg-warning text-warning-foreground flex items-center justify-center">
                        ARB
                      </div>
                      <span>Arbitrum</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="font-medium">0.5 AVAX</div>
                </div>
              </CardFooter>
            </Card>
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


function BitcoinIcon(props: any) {
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
      <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727" />
    </svg>
  )
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
