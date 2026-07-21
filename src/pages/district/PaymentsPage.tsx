import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePayments, useCollectPayment } from "@/hooks/usePayments";
import { useCards } from "@/hooks/useCards";
import { PageHeader } from "@/components/shared/PageHeader";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { AppDrawer } from "@/components/shared/AppDrawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaymentTimeline from "@/features/payments/PaymentTimeline";
import type { PaymentStatus } from "@/types/payment.types";
import { CreditCard } from "lucide-react";

const TABS: { value: PaymentStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "collected", label: "Collected" },
  { value: "waiting_confirmation", label: "Waiting" },
  { value: "confirmed", label: "Confirmed" },
];

export default function PaymentsPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === "hi";
  const [tab, setTab] = useState<PaymentStatus | "all">("all");
  const { data, isLoading, isError, refetch } = usePayments({ status: tab });
  const { data: cards } = useCards();
  const collectPayment = useCollectPayment();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [amount, setAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setSelectedCardId("");
    setAmount("");
    setReceiptFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCollect = () => {
    if (collectPayment.isPending || !selectedCardId || !amount || !receiptFile) return;
    collectPayment.mutate(
      {
        driverCardId: selectedCardId,
        amount: parseFloat(amount),
        file: receiptFile,
      },
      {
        onSuccess: () => {
          setDrawerOpen(false);
          resetForm();
          void refetch();
        },
      },
    );
  };

  const canSubmit =
    selectedCardId && amount && parseFloat(amount) > 0 && receiptFile;

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? "भुगतान" : "Payments"}
        subtitle={
          isHi
            ? "भुगतान संग्रह और पुष्टिकरण को ट्रैक करें"
            : "Track payment collection and confirmation"
        }
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="cursor-pointer"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={tab} className="mt-6">
          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {!isLoading && !isError && !data?.length && (
            <EmptyState
              icon={CreditCard}
              title={isHi ? "कोई भुगतान नहीं मिला" : "No payments found"}
            />
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {data?.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 shadow-card"
              >
                <PaymentTimeline payment={p} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <AppDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          resetForm();
        }}
        loading={collectPayment.isPending}
        title="Record Payment Collection"
        footer={
          <Button
            className="w-full"
            onClick={handleCollect}
            loading={collectPayment.isPending}
            loadingText="Recording…"
            disabled={!canSubmit}
          >
            Record Payment
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>
              Driver card <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedCardId} onValueChange={setSelectedCardId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a driver card" />
              </SelectTrigger>
              <SelectContent>
                {cards?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.cardNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>
              Amount (₹) <span className="text-red-500">*</span>
            </Label>
            <Input
              className="mt-1"
              type="number"
              min="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <Label>
              Payment receipt <span className="text-red-500">*</span>
            </Label>
            <Input
              className="mt-1"
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
      </AppDrawer>
    </div>
  );
}
