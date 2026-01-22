"use client";

import { IInvoice, IClient, IShipment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceStatusBadge } from "./invoice-status-badge";

interface InvoicePreviewProps {
    invoice: IInvoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
    const client = invoice.client as IClient;
    const shipments = (invoice.shipments || []) as IShipment[];

    return (
        <Card className="bg-white shadow-lg">
            <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-primary">INVOICE / FACTURE</h2>
                        <p className="text-lg font-medium mt-1">Transport & Delivery Co.</p>
                        <p className="text-sm text-muted-foreground">123 Business St, Algiers</p>
                        <p className="text-sm text-muted-foreground">Tel: +213 555 123 456</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold font-mono">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Date: {formatDate(invoice.issueDate)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Due: {formatDate(invoice.dueDate)}
                        </p>
                        <div className="mt-2">
                            <InvoiceStatusBadge status={invoice.status} />
                        </div>
                    </div>
                </div>

                {/* Bill To */}
                <div className="border-b pb-4">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Bill To:</p>
                    {client && (
                        <>
                            <p className="font-semibold">{client.firstName} {client.lastName}</p>
                            {client.companyName && <p className="text-sm">{client.companyName}</p>}
                            <p className="text-sm text-muted-foreground">
                                {client.address?.street}, {client.address?.city} {client.address?.postalCode}
                            </p>
                            <p className="text-sm text-muted-foreground">{client.phone}</p>
                            <p className="text-sm text-muted-foreground">{client.email}</p>
                        </>
                    )}
                </div>

                {/* Line Items */}
                <div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2">#</th>
                                <th className="text-left py-2">Description</th>
                                <th className="text-right py-2">Amount HT</th>
                                <th className="text-right py-2">TVA</th>
                                <th className="text-right py-2">Total TTC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shipments.map((shipment, idx) => (
                                <tr key={shipment._id?.toString() || idx} className="border-b">
                                    <td className="py-2">{idx + 1}</td>
                                    <td className="py-2">
                                        <p className="font-mono text-xs">{shipment.shipmentNumber}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {shipment.senderAddress?.city} → {shipment.receiverAddress?.city}
                                        </p>
                                    </td>
                                    <td className="text-right py-2">
                                        {formatCurrency(shipment.priceBreakdown?.baseAmount || 0)}
                                    </td>
                                    <td className="text-right py-2">
                                        {formatCurrency((shipment.priceBreakdown?.baseAmount || 0) * 0.19)}
                                    </td>
                                    <td className="text-right py-2 font-medium">
                                        {formatCurrency(shipment.totalAmount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64 space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal (HT):</span>
                            <span>{formatCurrency(invoice.amountHT)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">TVA ({invoice.tvaRate}%):</span>
                            <span>{formatCurrency(invoice.tvaAmount)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 font-bold text-base">
                            <span>Total TTC:</span>
                            <span>{formatCurrency(invoice.totalTTC)}</span>
                        </div>
                        {invoice.amountPaid > 0 && (
                            <>
                                <div className="flex justify-between text-green-600">
                                    <span>Amount Paid:</span>
                                    <span>{formatCurrency(invoice.amountPaid)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-red-600">
                                    <span>Balance Due:</span>
                                    <span>{formatCurrency(invoice.amountDue)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Payment Info */}
                <div className="border-t pt-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Payment Instructions:</p>
                    <p>Bank: ABC Bank Algeria</p>
                    <p>Account: 123456789</p>
                    <p>IBAN: DZ89 1234 5678 9012 3456</p>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="border-t pt-4 text-sm">
                        <p className="font-medium mb-1">Notes:</p>
                        <p className="text-muted-foreground">{invoice.notes}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-muted-foreground border-t pt-4">
                    <p>Thank you for your business!</p>
                    <p>Questions? Contact us at billing@transport.dz</p>
                </div>
            </CardContent>
        </Card>
    );
}
