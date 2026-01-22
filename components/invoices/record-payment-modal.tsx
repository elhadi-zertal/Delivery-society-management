"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IInvoice, PaymentMethod } from "@/types";
import { invoicesApi, RecordPaymentInput } from "@/lib/api/invoices";
import { formatCurrency } from "@/lib/utils/formatting";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CreditCard, Banknote, Building, Smartphone } from "lucide-react";

const paymentSchema = z.object({
    amount: z.number().positive("Amount must be positive"),
    paymentMethod: z.nativeEnum(PaymentMethod),
    paymentDate: z.coerce.date(),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: IInvoice;
    onSuccess?: () => void;
}

const paymentMethodIcons: Record<PaymentMethod, React.ElementType> = {
    [PaymentMethod.CASH]: Banknote,
    [PaymentMethod.BANK_TRANSFER]: Building,
    [PaymentMethod.CHECK]: CreditCard,
    [PaymentMethod.CARD]: CreditCard,
};

export function RecordPaymentModal({ isOpen, onClose, invoice, onSuccess }: RecordPaymentModalProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema) as any,
        defaultValues: {
            amount: invoice.amountDue,
            paymentMethod: PaymentMethod.CASH,
            paymentDate: new Date(),
            reference: "",
            notes: "",
        },
    });

    const watchAmount = form.watch("amount");
    const newBalance = invoice.amountDue - (watchAmount || 0);
    const isFullPayment = watchAmount >= invoice.amountDue;
    const isOverpayment = watchAmount > invoice.amountDue;

    const onSubmit = async (data: PaymentFormValues) => {
        setLoading(true);
        try {
            await invoicesApi.recordPayment(invoice._id.toString(), data);
            toast.success("Payment recorded successfully");
            onClose();
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to record payment");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAmount = (percentage: number) => {
        const amount = invoice.amountDue * percentage;
        form.setValue("amount", Math.round(amount * 100) / 100);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                        Invoice #{invoice.invoiceNumber}
                    </DialogDescription>
                </DialogHeader>

                {/* Invoice Summary */}
                <Card className="bg-muted/50">
                    <CardContent className="pt-4 space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Invoice Total:</span>
                            <span className="font-medium">{formatCurrency(invoice.totalTTC)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount Paid:</span>
                            <span className="font-medium text-green-600">{formatCurrency(invoice.amountPaid)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                            <span className="font-medium">Balance Due:</span>
                            <span className="font-bold text-red-600">{formatCurrency(invoice.amountDue)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Quick Amount Buttons */}
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => handleQuickAmount(0.25)}>
                                25%
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => handleQuickAmount(0.5)}>
                                50%
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => handleQuickAmount(0.75)}>
                                75%
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => handleQuickAmount(1)}>
                                Full
                            </Button>
                        </div>

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Amount *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            className="text-lg font-bold"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    {isOverpayment && (
                                        <p className="text-xs text-yellow-600">
                                            Overpayment of {formatCurrency(watchAmount - invoice.amountDue)}
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Method *</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(PaymentMethod).map((method) => {
                                                        const Icon = paymentMethodIcons[method];
                                                        return (
                                                            <SelectItem key={method} value={method}>
                                                                <div className="flex items-center gap-2">
                                                                    <Icon className="h-4 w-4" />
                                                                    {method.replace(/_/g, " ")}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Date *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="reference"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reference Number (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Check #, Transaction ID..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Additional payment details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Payment Preview */}
                        <Card className={isFullPayment ? "border-green-300 bg-green-50" : "border-yellow-300 bg-yellow-50"}>
                            <CardContent className="pt-4 text-sm">
                                <div className="flex justify-between font-medium">
                                    <span>New Balance:</span>
                                    <span className={newBalance <= 0 ? "text-green-600" : "text-yellow-600"}>
                                        {formatCurrency(Math.max(0, newBalance))}
                                    </span>
                                </div>
                                <p className="text-xs mt-1 text-muted-foreground">
                                    {isFullPayment
                                        ? "This payment will mark the invoice as PAID"
                                        : "Invoice will be marked as PARTIALLY PAID"}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Record Payment
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
