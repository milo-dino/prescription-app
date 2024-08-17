import { FC, FormEvent, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
// Internal assets
import Copy from "@/assets/icons/copy.svg";
import ExternalLink from "@/assets/icons/external-link.svg";
import Placeholder1 from "@/assets/placeholders/bear-1.png";
// Internal utils
import { truncateAddress } from "@/utils/truncateAddress";
import { clampNumber } from "@/utils/clampNumber";
import { formatDate } from "@/utils/formatDate";
import { aptosClient } from "@/utils/aptosClient";
// Internal hooks
import { useGetCollectionData } from "@/hooks/useGetCollectionData";
// Internal components
import { Image } from "@/components/ui/image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Socials } from "@/pages/Mint/components/Socials";
// Internal constants
import { NETWORK } from "@/constants";
// Internal config
import { config } from "@/config";
// Internal enrty functions
import { mintNFT } from "@/entry-functions/mint_nft";

import { PillBottleIcon, RotateCcwIcon } from "lucide-react";

interface HeroSectionProps {}

interface FormData {
  patientAddress: string;
  medicationName: string;
  dosage: string;
  dosageUnit: string;
  num_pills: string;
  date_filled: string;
  expiration_time: string;
  prescriptionFile: File | null;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  const { data } = useGetCollectionData();
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();
  const [nftCount, setNftCount] = useState(1);

  const { collection, totalMinted = 0, maxSupply = 1 } = data ?? {};

  const mintNft = async (e: FormEvent) => {
    e.preventDefault();

    if (!account || !data?.isMintActive) return;
    if (!collection?.collection_id) return;

    const response = await signAndSubmitTransaction(
      mintNFT({ collectionId: collection.collection_id, amount: nftCount, prescriptionData: JSON.stringify(formData) }),
    );
    await aptosClient().waitForTransaction({ transactionHash: response.hash });
    queryClient.invalidateQueries();
    setNftCount(1);
  };

  const [formData, setFormData] = useState<FormData>({
    patientAddress: "",
    medicationName: "",
    dosage: "",
    dosageUnit: "",
    num_pills: "",
    date_filled: "",
    expiration_time: "",
    prescriptionFile: null,
  });

  const handleReset = () => {
    setFormData({
      patientAddress: "",
      medicationName: "",
      dosage: "",
      dosageUnit: "",
      num_pills: "",
      date_filled: "",
      expiration_time: "",
      prescriptionFile: null,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, prescriptionFile: e.target.files[0] });
    }
  };

  return (
    <section className="hero-container flex flex-col md:flex-row gap-6 px-4 max-w-screen-xl mx-auto w-full">
      <div className="flex flex-col gap-4 w-full">
        <h1 className="title-md">{collection?.collection_name ?? config.defaultCollection?.name}</h1>
        <p className="body-sm">{collection?.description ?? config.defaultCollection?.description}</p>

        <Card className="w-full">
          <CardContent
            fullPadding
            className="flex flex-auto md:flex-row gap-4 md:justify-between items-start md:items-center flex-wrap w-full"
          >
            <form onSubmit={mintNft} className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <label className="w-full md:w-1/4 text-right pr-4">Patient Address</label>
                  <Input
                    type="text"
                    name="patientAddress"
                    value={formData.patientAddress}
                    onChange={handleChange}
                    placeholder="Patient Address"
                    required
                    className="w-full md:w-3/4"
                  />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <label className="w-full md:w-1/4 text-right pr-4">Medication Name</label>
                  <Input
                    type="text"
                    name="medicationName"
                    value={formData.medicationName}
                    onChange={handleChange}
                    placeholder="Medication Name"
                    required
                    className="w-full md:w-3/4"
                  />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <label className="w-full md:w-1/4 text-right pr-4">Dosage</label>
                  <Input
                    type="number"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    placeholder="Dosage"
                    required
                    className="w-full md:w-3/4"
                  />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <label className="w-full md:w-1/4 text-right pr-4">Dosage Unit</label>
                  <Input
                    type="text"
                    name="dosageUnit"
                    value={formData.dosageUnit}
                    onChange={handleChange}
                    placeholder="Dosage Unit"
                    required
                    className="w-full md:w-3/4"
                  />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <label className="w-full md:w-1/4 text-right pr-4">Qty Dispensed</label>
                  <Input
                    type="number"
                    name="num_pills"
                    value={formData.num_pills}
                    onChange={handleChange}
                    placeholder="Amount of Pills"
                    required
                    className="w-full md:w-3/4"
                  />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <label className="w-full md:w-1/4 text-right pr-4">From</label>
                  <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-3/4">
                    <Input
                      type="date"
                      name="date_filled"
                      value={formData.date_filled}
                      onChange={handleChange}
                      placeholder="Date"
                      required
                      className="w-full md:w-1/2"
                    />
                    <label className="w-full md:w-auto text-right pr-4 md:pr-2">To</label>
                    <Input
                      type="date"
                      name="expiration_time"
                      value={formData.expiration_time}
                      onChange={handleChange}
                      placeholder="Expiration Time"
                      required
                      className="w-full md:w-1/2"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <label className="w-full md:w-1/4 text-right pr-4">Prescription Document</label>
                  <Input
                    type="file"
                    name="prescription_file"
                    onChange={handleFileChange}
                    placeholder="Prescription File"
                    required
                    className="w-full md:w-3/4"
                  />
                </div>
              </div>

              <div className="flex justify-left gap-6 ml-16 mt-4">
                <Button className="h-16 md:h-auto gap-4 hover:bg-[#d42929] hover:text-white" onClick={handleReset}>
                  Reset
                  <RotateCcwIcon />
                </Button>
                <Button
                  className="h-16 md:h-auto gap-4 hover:bg-[#1c970c] hover:text-white"
                  type="submit"
                  disabled={data?.isMintActive}
                >
                  Mint
                  <PillBottleIcon />
                </Button>
              </div>
            </form>

            <div className="flex flex-col gap-2 w-full">
              <p className="label-sm text-secondary-text">
                {clampNumber(totalMinted)} / {clampNumber(maxSupply)} Minted
              </p>
              <Progress value={(totalMinted / maxSupply) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-x-2 items-center flex-wrap justify-between">
          <p className="whitespace-nowrap body-sm-semibold">Collection Address</p>

          <div className="flex gap-x-2">
            <AddressButton address={collection?.collection_id ?? ""} />
            <a
              className={buttonVariants({ variant: "link" })}
              target="_blank"
              href={`https://explorer.aptoslabs.com/account/${collection?.collection_id}?network=${NETWORK}`}
            >
              View on Explorer <Image src={ExternalLink} />
            </a>
          </div>
        </div>

        <div>
          {data?.startDate && new Date() < data.startDate && (
            <div className="flex gap-x-2 justify-between flex-wrap">
              <p className="body-sm-semibold">Minting starts</p>
              <p className="body-sm">{formatDate(data.startDate)}</p>
            </div>
          )}

          {data?.endDate && new Date() < data.endDate && !data.isMintInfinite && (
            <div className="flex gap-x-2 justify-between flex-wrap">
              <p className="body-sm-semibold">Minting ends</p>
              <p className="body-sm">{formatDate(data.endDate)}</p>
            </div>
          )}

          {data?.endDate && new Date() > data.endDate && <p className="body-sm-semibold">Minting has ended</p>}
        </div>
      </div>
    </section>
  );
};

const AddressButton: FC<{ address: string }> = ({ address }) => {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (copied) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <Button onClick={onCopy} className="whitespace-nowrap flex gap-1 px-0 py-0" variant="link">
      {copied ? (
        "Copied!"
      ) : (
        <>
          {truncateAddress(address)}
          <Image src={Copy} className="dark:invert" />
        </>
      )}
    </Button>
  );
};
