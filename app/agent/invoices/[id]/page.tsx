"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { IInvoice, IClient, IPayment, InvoiceStatus } from "@/types";
import { invoicesApi } from "@/lib/api/invoices";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import { RecordPaymentModal } from "@/components/invoices/record-payment-modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils/formatting";
import {
    ArrowLeft,
    Pencil,
    CreditCard,
    Download,
    Printer,
    XCircle,
    Loader2,
    Check,
    Clock,
    Calendar,
    User,
    FileText,
} from "lucide-react";

export default function InvoiceDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const invoiceId = params.id as string;

    const [invoice, setInvoice] = useState<IInvoice | null>(null);
    const [payments, setPayments] = useState<IPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentModal, setPaymentModal] = useState(false);
    const [cancelDialog, setCancelDialog] = useState(false);

    const loadInvoice = async () => {
        setLoading(true);
        try {
            const [invoiceData, paymentsData] = await Promise.all([
                invoicesApi.getById(invoiceId),
                invoicesApi.getPayments(invoiceId),
            ]);
            setInvoice(invoiceData);
            setPayments(paymentsData);
        } catch (error: any) {
            toast.error(error.message || "Failed to load invoice");
            router.push("/agent/invoices");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (invoiceId) loadInvoice();
    }, [invoiceId]);

    const handleDownloadPDF = async () => {
        try {
            const blob = await invoicesApi.downloadPDF(invoiceId);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Invoice-${invoice?.invoiceNumber}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            toast.error("Failed to download PDF");
        }
    };

    const handleCancel = async () => {
        try {
            await invoicesApi.cancel(invoiceId);
            toast.success("Invoice cancelled");
            loadInvoice();
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel invoice");
        } finally {
            setCancelDialog(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="container mx-auto py-6 text-center">
                <p>Invoice not found</p>
                <Button className="mt-4" onClick={() => router.push("/agent/invoices")}>
                    Back to Invoices
                </Button>
            </div>
        );
    }

    const client = invoice.client as IClient;
    const daysUntilDue = Math.ceil((new Date(invoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilDue < 0 && invoice.amountDue > 0;

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold font-mono">{invoice.invoiceNumber}</h1>
                            <InvoiceStatusBadge status={invoice.status} size="md" />
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Issued {formatDate(invoice.issueDate)} • Due {formatDate(invoice.dueDate)}
                            {isOverdue && <span className="text-red-600 ml-2">({Math.abs(daysUntilDue)} days overdue)</span>}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {invoice.status === InvoiceStatus.DRAFT && (
                        <Button variant="outline">
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                        </Button>
                    )}
                    {invoice.amountDue > 0 && invoice.status !== InvoiceStatus.CANCELLED && (
                        <Button onClick={() => setPaymentModal(true)}>
                            <CreditCard className="h-4 w-4 mr-2" /> Record Payment
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleDownloadPDF}>
                        <Download className="h-4 w-4 mr-2" /> PDF
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="h-4 w-4 mr-2" /> Print
                    </Button>
                    {invoice.amountDue === invoice.totalTTC && invoice.status !== InvoiceStatus.CANCELLED && (
                        <Button variant="destructive" onClick={() => setCancelDialog(true)}>
                            <XCircle className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Invoice Preview */}
                <div className="lg:col-span-2">
                    <InvoicePreview invoice={invoice} />
                </div>

                {/* Right Column - Info Cards */}
                <div className="space-y-6">
                    {/* Client Info */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" /> Client
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {client && (
                                <div className="space-y-1 text-sm">
                                    <p className="font-semibold">{client.firstName} {client.lastName}</p>
                                    {client.companyName && <p>{client.companyName}</p>}
                                    <p className="text-muted-foreground">{client.email}</p>
                                    <p className="text-muted-foreground">{client.phone}</p>
                                    <Button variant="link" className="p-0 h-auto text-sm" onClick={() => router.push(`/agent/clients/${client._id}`)}>
                                        View Client →
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dates */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5" /> Dates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Issue Date:</span>
                                <span>{formatDate(invoice.issueDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Due Date:</span>
                                <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                                    {formatDate(invoice.dueDate)}
                                </span>
                            </div>
                            {!isOverdue && invoice.amountDue > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Days Until Due:</span>
                                    <span className={daysUntilDue <= 7 ? "text-yellow-600" : ""}>
                                        {daysUntilDue} days
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Payment History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {payments.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No payments recorded</p>
                            ) : (
                                <div className="space-y-3">
                                    {payments.map((payment) => (
                                        <div key={payment._id.toString()} className="flex items-center gap-3 text-sm">
                                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                                <Check className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{formatCurrency(payment.amount)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(payment.paymentDate)} • {payment.paymentMethod.replace(/_/g, " ")}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="border-t pt-2 flex justify-between text-sm">
                                        <span className="font-medium">Total Paid:</span>
                                        <span className="font-bold text-green-600">{formatCurrency(invoice.amountPaid)}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Balance Summary */}
                    {invoice.amountDue > 0 && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-4">
                                <div className="text-center">
                                    <p className="text-sm text-red-600">Balance Due</p>
                                    <p className="text-3xl font-bold text-red-600">{formatCurrency(invoice.amountDue)}</p>
                                    <Button className="mt-3 w-full" onClick={() => setPaymentModal(true)}>
                                        <CreditCard className="h-4 w-4 mr-2" /> Record Payment
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {invoice.status === InvoiceStatus.PAID && (
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="pt-4">
                                <div className="text-center">
                                    <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <p className="font-bold text-green-600">Paid in Full</p>
                                    <p className="text-sm text-green-600">{formatCurrency(invoice.totalTTC)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Modals */}
            {paymentModal && invoice && (
                <RecordPaymentModal
                    isOpen={true}
                    onClose={() => setPaymentModal(false)}
                    invoice={invoice}
                    onSuccess={loadInvoice}
                />
            )}

            <ConfirmDialog
                open={cancelDialog}
                onOpenChange={() => setCancelDialog(false)}
                onConfirm={handleCancel}
                title="Cancel Invoice"
                description="Are you sure you want to cancel this invoice? This action cannot be undone."
                variant="destructive"
            />
        </div>
    );
}
