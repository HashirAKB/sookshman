"use client"

// Import necessary cryptographic libraries and utilities
import nacl from "tweetnacl"; // For generating key pairs
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39"; // For mnemonic phrase operations
import { derivePath } from "ed25519-hd-key"; // For deriving keys from seed
import { Keypair } from "@solana/web3.js"; // For Solana-specific key pair generationi
import bs58 from "bs58"; // For Base58 encoding/decoding
import { ethers } from "ethers"; // For Ethereum wallet operations

import React, { useState, useEffect} from "react"
import {Button} from '@/components/ui/button'
import { toast } from "sonner"
import { motion } from "framer-motion";
import { ToastAction } from "@/components/ui/toast"
import {
    ChevronDown,
    ChevronUp,
    Copy,
    Eye,
    EyeOff,
    Grid2X2,
    List,
    Trash,
} from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,    
} from "@/components/ui/alert-dialog"

import { Input } from "@/components/ui/input"
import { Console } from "console";

interface Wallet {
    publicKey: string;
    privateKey: string;
    mnemonic: string;
    path: string;
}

export const WalletGenerator = () => {

    const [mnemonicWords, setMnemonicWords] = useState<string[]>(
        Array(12).fill(" ")
      );
    const [pathTypes, setPathTypes] = useState<string[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [showMnemonic, setShowMnemonic] = useState<boolean>(false);
    const [mnemonicInput, setMnemonicInput] = useState<string>("");
    const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<boolean[]>([]);
    const [visiblePhrases, setVisiblePhrases] = useState<boolean[]>([]);
    const [gridView, setGridView] = useState<boolean>(false);
    const pathTypeNames: { [key: string]: string } = {
        "501": "Solana",
        "60": "Ethereum",
    };
    const pathTypeName = pathTypeNames[pathTypes[0]] || "";

    // Function to generate a wallet from a mnemonic phrase
const generateWalletFromMnemonic = async(
  pathType: string, // Specifies the blockchain type (e.g., "501" for Solana, "60" for Ethereum)
  mnemonic: string, // The mnemonic phrase to generate the wallet from
  accountIndex: number // The index of the account to generate
): Promise<Wallet | null> =>{
  try {
    // Convert mnemonic to seed
    /**
     * Mnemonic: valve price miracle leaf mutual bicycle siren jeans embody orbit flush voice
     * 
     * Seed (Buffer): <Buffer 7c 8c 5e 3e 10 8c a8 89 d7 d5 70 b0 ba fb 42 c3 f3 80 47 82 d6 2c 1d 22 10 2a 39 5e 1b 72 45 2d 1c a1 b2 9a ee 3c 6c 11 fc 90 b8 60 fc 70 a8 df ... 14 more bytes>
     * 
     * Seed (hex): 7c8c5e3e108ca889d7d570b0bafb42c3f3804782d62c1d22102a395e1b72452d1ca1b29aee3c6c11fc90b860fc70a8df7fbe4790f9831c0556f5f83b1e9f3c0
     * 
     * The input is a 12-word mnemonic phrase.
     * The output seed is 64 bytes (512 bits) long.
     * The seed is represented both as a hexadecimal string and as a Buffer object.
     * 
     * This seed can then be used to derive private keys for various cryptocurrencies using the appropriate derivation paths, using the `derivePath` function.
     */
    const seedBuffer = mnemonicToSeedSync(mnemonic);
    // console.log(" Path Selected: %d\n Account Index: %d\n",pathType, mnemonic, accountIndex);
    // console.log("SeedBuffer: ", seedBuffer);
    // Construct the derivation path based on the blockchain type and account index
    const path = `m/44'/${pathType}'/0'/${accountIndex}'`;
    // console.log('Full Path:',path);

    // Derive the seed from the path and seed buffer
    const { key: derivedSeed } = derivePath(path, seedBuffer.toString("hex"));
    // console.log('derivedSeed:',derivedSeed);
    //key: Seed (hex): 7c8c5e3e108ca889d7d570b0bafb42c3f3804782d62c1d22102a395e1b72452d1ca1b29aee3c6c11fc90b860fc70a8df7fbe4790f9831c0556f5f83b1e9f3c0

    let publicKeyEncoded: string;
    let privateKeyEncoded: string;

    /**
     * Wallet generation for Solana (pathType "501") and Ethereum (pathType "60").
     * Handles different key generation, encoding, and address formats:
     * - Solana: Uses NaCl for key pair, Base58 encoding for keys
     * - Ethereum: Uses derived seed as private key, standard address format
     * Ensures correct cryptographic operations per blockchain.
    **/

    if (pathType === "501") {
      // Solana wallet generation
      const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
      // console.log("Secret Key:",secretKey)
      const keypair = Keypair.fromSecretKey(secretKey);
      // console.log('KeyPair:',keypair);
      privateKeyEncoded = bs58.encode(secretKey);
      publicKeyEncoded = keypair.publicKey.toBase58();
      // console.log("private key: ",privateKeyEncoded)
      // console.log("public key: ",publicKeyEncoded)
    // Encode private key to Base58
    // Encode public key to Base58
    } else if (pathType === "60") {
      // Ethereum wallet generation
      const privateKey = Buffer.from(derivedSeed).toString("hex");
      privateKeyEncoded = privateKey;

      const wallet = new ethers.Wallet(privateKey);
      publicKeyEncoded = wallet.address; // Get Ethereum address
    } else {
      // Handle unsupported blockchain types
      toast.error("Unsupported path type.");
      return null;
    }

    // Return the generated wallet information
    return {
      publicKey: publicKeyEncoded,
      privateKey: privateKeyEncoded,
      mnemonic,
      path,
    };
  } catch (error) {
    // Handle any errors during wallet generation
    toast.error("Failed to generate wallet. Please try again.");
    return null;
  }
};

const copyToClipboard = (content: string) => {
  navigator.clipboard.writeText(content);
  toast("Copied to clipboard!");
};

const togglePrivateKeyVisibility = (index: number) => {
  setVisiblePrivateKeys(
    visiblePrivateKeys.map((visible, i) => (i === index ? !visible : visible))
  );
};

const togglePhraseVisibility = (index: number) => {
  setVisiblePhrases(
    visiblePhrases.map((visible, i) => (i === index ? !visible : visible))
  );
};

const handleClearWallets = () => {
  localStorage.removeItem("wallets");
  localStorage.removeItem("mnemonics");
  localStorage.removeItem("paths");
  setWallets([]);
  setMnemonicWords([]);
  setPathTypes([]);
  setVisiblePrivateKeys([]);
  setVisiblePhrases([]);
  toast("All wallets cleared.");
};

const handleAddWallet = async() => {
  if (!mnemonicWords) {
    toast("No mnemonic found. Please generate a wallet first");
    return;
  }

  const wallet = await generateWalletFromMnemonic(
    pathTypes[0],
    mnemonicWords.join(" "),
    wallets.length
  );
  if (wallet) {
    // console.log("Newly Added account:", wallet);
    // console.log("Existing:", wallets);
    const updatedWallets = [...wallets, wallet];
    const updatedPathType = [pathTypes, pathTypes];
    localStorage.setItem("wallets", JSON.stringify(updatedWallets));
    localStorage.setItem("pathTypes", JSON.stringify(updatedPathType));
    setWallets(updatedWallets);
    setVisiblePrivateKeys([...visiblePrivateKeys, false]);
    setVisiblePhrases([...visiblePhrases, false]);
    toast("Wallet generated successfully!");
  }
};

const handleDeleteWallet = (index: number) => {
  const updatedWallets = wallets.filter((_, i) => i !== index);
  const updatedPathTypes = pathTypes.filter((_, i) => i !== index);

  setWallets(updatedWallets);
  setPathTypes(updatedPathTypes);
  localStorage.setItem("wallets", JSON.stringify(updatedWallets));
  localStorage.setItem("paths", JSON.stringify(updatedPathTypes));
  setVisiblePrivateKeys(visiblePrivateKeys.filter((_, i) => i !== index));
  setVisiblePhrases(visiblePhrases.filter((_, i) => i !== index));
  toast("Wallet deleted successfully!");
};

// Function to handle wallet generation process
const handleGenerateWallet = async() => {
  let mnemonic = mnemonicInput.trim(); // Get and trim the mnemonic input

  if (mnemonic) {
    // Validate existing mnemonic if provided
    if (!validateMnemonic(mnemonic)) {
      toast.error("Invalid recovery phrase.")
    }
  } else {
    // Generate a new mnemonic if not provided
    mnemonic = generateMnemonic();
    // console.log('Generated Mnemonic:',mnemonic);
  }

  // Split mnemonic into words and update state
  const words = mnemonic.split(" ");

  setMnemonicWords(words);


  // Generate wallet using the mnemonic
  const wallet = await generateWalletFromMnemonic(
    pathTypes[0], // Use the first path type (assumed to be set elsewhere)
    mnemonic,
    wallets.length // Use current number of wallets as the account index
  );
  if (wallet) {
    // console.log('Wallet:',wallet);
    // If wallet generation successful, update state and local storage
    const updatedWallets = [...wallets, wallet];
    setWallets(updatedWallets);
    localStorage.setItem("wallets", JSON.stringify(updatedWallets));
    localStorage.setItem("mnemonics", JSON.stringify(words));
    localStorage.setItem("paths", JSON.stringify(pathTypes));
    setVisiblePrivateKeys([...visiblePrivateKeys, false]);
    setVisiblePhrases([...visiblePhrases, false]);
    toast("Wallet generated successfully!");
  }
};

    useEffect(() => {
        const storedWallets = localStorage.getItem("wallets");
        const storedMnemonic = localStorage.getItem("mnemonics");
        const storedPathTypes = localStorage.getItem("paths");
    
        if (storedWallets && storedMnemonic && storedPathTypes) {
          setMnemonicWords(JSON.parse(storedMnemonic));
          setWallets(JSON.parse(storedWallets));
          setPathTypes(JSON.parse(storedPathTypes));
          setVisiblePrivateKeys(JSON.parse(storedWallets).map(() => false));
          setVisiblePhrases(JSON.parse(storedWallets).map(() => false));
        }
    }, []);

    return (
        <div className="flex flex-col gap-4">
          {wallets.length === 0 && (
            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
            > 
              <div className="flex flex-col gap-4">
                {pathTypes.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                    className="flex gap-4 flex-col my-12"
                  >
                    <div className="flex flex-col gap-2">
                      <h1 className="tracking-tighter text-4xl md:text-5xl font-black">
                        Sookshman supports multiple blockchains
                      </h1>
                      <p className="text-primary/80 font-semibold text-lg md:text-xl">
                        Choose a blockchain to get started.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size={"lg"}
                        onClick={() => {
                          setPathTypes(["501"]);
                          toast.success(
                            "Wallet selected. Please generate a wallet to continue."
                          );
                        }}
                      >
                        Solana
                      </Button>
                      <Button
                        size={"lg"}
                        onClick={() => {
                          setPathTypes(["60"]);
                          toast.success("Wallet selected. Please generate a wallet to continue.");
                        }}
                      >
                        Ethereum
                      </Button>
                    </div>
                  </motion.div>
                )}
                {pathTypes.length !== 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                    className="flex flex-col gap-4 my-12"
                  >
                    <div className="flex flex-col gap-2">
                      <h1 className="tracking-tighter text-4xl md:text-5xl font-black">
                        Secret Recovery Phrase
                      </h1>
                      <p className="text-primary/80 font-semibold text-lg md:text-xl">
                        Save these words in a safe place.
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <Input
                        type="password"
                        placeholder="Enter your secret phrase (or leave blank to generate)"
                        onChange={(e) => setMnemonicInput(e.target.value)}
                        value={mnemonicInput}
                      />
                      <Button size={"lg"} onClick={() => handleGenerateWallet()}>
                        {mnemonicInput ? "Add Wallet" : "Generate Wallet"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
    
          {/* Display Secret Phrase */}
          {mnemonicWords && wallets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="group flex flex-col items-center gap-4 cursor-pointer rounded-lg border border-primary/10 p-8"
            >
              <div
                className="flex w-full justify-between items-center"
                onClick={() => setShowMnemonic(!showMnemonic)}
              >
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
                  Your Secret Phrase
                </h2>
                <Button
                  onClick={() => setShowMnemonic(!showMnemonic)}
                  variant="ghost"
                >
                  {showMnemonic ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>
              </div>
    
              {showMnemonic && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  className="flex flex-col w-full items-center justify-center"
                  onClick={() => copyToClipboard(mnemonicWords.join(" "))}
                >
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center w-full items-center mx-auto my-8"
                  >
                    {mnemonicWords.map((word, index) => (
                      <p
                        key={index}
                        className="md:text-lg bg-foreground/5 hover:bg-foreground/10 transition-all duration-300 rounded-lg p-4"
                      >
                        {word}
                      </p>
                    ))}
                  </motion.div>
                  <div className="text-sm md:text-base text-primary/50 flex w-full gap-2 items-center group-hover:text-primary/80 transition-all duration-300">
                    <Copy className="size-4" /> Click Anywhere To Copy
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
    
          {/* Display wallet pairs */}
          {wallets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="flex flex-col gap-8 mt-6"
            >
              <div className="flex md:flex-row flex-col justify-between w-full gap-4 md:items-center">
                <h2 className="tracking-tighter text-3xl md:text-4xl font-extrabold">
                  {pathTypeName} Wallet
                </h2>
                <div className="flex gap-2">
                  {wallets.length > 1 && (
                    <Button
                      variant={"ghost"}
                      onClick={() => setGridView(!gridView)}
                      className="hidden md:block"
                    >
                      {gridView ? <Grid2X2 /> : <List />}
                    </Button>
                  )}
                  <Button onClick={() => handleAddWallet()}>Add Wallet</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="self-end">
                        Clear Wallets
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to delete all wallets?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete
                          your wallets and keys from local storage.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleClearWallets()}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div
                className={`grid gap-6 grid-cols-1 col-span-1  ${
                  gridView ? "md:grid-cols-2 lg:grid-cols-3" : ""
                }`}
              >
                {wallets.map((wallet: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.3 + index * 0.1,
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                    className="flex flex-col rounded-2xl border border-primary/10"
                  >
                    <div className="flex justify-between px-8 py-6">
                      <h3 className="font-bold text-2xl md:text-3xl tracking-tighter ">
                        Wallet {index + 1}
                      </h3>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex gap-2 items-center"
                          >
                            <Trash className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you sure you want to delete this account?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently
                              delete your account inlcuding private and public keys from local storage.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteWallet(index)}
                              className="text-destructive"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="flex flex-col gap-8 px-8 py-4 rounded-2xl bg-secondary/50">
                      <div
                        className="flex flex-col w-full gap-2"
                        onClick={() => copyToClipboard(wallet.publicKey)}
                      >
                        <span className="text-lg md:text-xl font-bold tracking-tighter">
                          Public Key
                        </span>
                        <p className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate">
                          {wallet.publicKey}
                        </p>
                      </div>
                      <div className="flex flex-col w-full gap-2">
                        <span className="text-lg md:text-xl font-bold tracking-tighter">
                          Private Key
                        </span>
                        <div className="flex justify-between w-full items-center gap-2">
                          <p
                            onClick={() => copyToClipboard(wallet.privateKey)}
                            className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate"
                          >
                            {visiblePrivateKeys[index]
                              ? wallet.privateKey
                              : "•".repeat(wallet.mnemonic.length)}
                          </p>
                          <Button
                            variant="ghost"
                            onClick={() => togglePrivateKeyVisibility(index)}
                          >
                            {visiblePrivateKeys[index] ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {/* <div className="flex flex-col w-full gap-2">
                        <span className="text-lg md:text-xl font-bold tracking-tighter">
                          Secret Phrase
                        </span>
                        <div className="flex justify-between w-full items-center gap-2">
                          <p
                            onClick={() => copyToClipboard(wallet.mnemonic)}
                            className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate"
                          >
                            {visiblePhrases[index]
                              ? wallet.mnemonic
                              : "•".repeat(wallet.mnemonic.length)}
                          </p>
    
                          <Button
                            variant="ghost"
                            onClick={() => togglePhraseVisibility(index)}
                          >
                            {visiblePhrases[index] ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                        </div>
                      </div> */}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      );
}