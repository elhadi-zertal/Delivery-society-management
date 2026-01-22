"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IInvoice, InvoiceStatus } from "@/types";
import { invoicesApi } from "@/lib/api/invoices";
import { formatCurrency } from "@/lib/utils/formatting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DollarSign, FileText, AlertTriangle, Clock, ArrowRight } from "lucide-react";

interface ClientBalanceCardProps {
    clientId: string;
}

export function ClientBalanceCard({ clientId }: ClientBalanceCardProps) {
    const router = useRouter();
    const [invoices, setInvoices] = useState<IInvoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInvoices = async () => {
            try {
                const data = await invoicesApi.getByClient(clientId);
                setInvoices(data);
            } catch (error) {
                console.error("Failed to load client invoices", error);
            } finally {
                setLoading(false);
            }
        };
        if (clientId) loadInvoices();
    }, [clientId]);

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const outstanding = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
    const overdueInvoices = invoices.filter(
        (inv) => inv.status === InvoiceStatus.OVERDUE || (new Date(inv.dueDate) < new Date() && inv.amountDue > 0)
    );
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.amountDue, 0);
    const paymentRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" /> Financial Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Total Invoiced</p>
                        <p className="text-lg font-bold">{formatCurrency(totalInvoiced)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Total Paid</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                    </div>
                </div>

                {/* Payment Progress */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span>Payment Rate</span>
                        <span>{Math.round(paymentRate)}%</span>
                    </div>
                    <Progress value={paymentRate} className="h-2" />
                </div>

                {/* Outstanding */}
                {outstanding > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700">
                            <Clock className="h-4 w-4" />
                            <div className="flex-1">
                                <p className="font-medium">Outstanding Balance</p>
                                <p className="text-2xl font-bold">{formatCurrency(outstanding)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Overdue Warning */}
                {overdueInvoices.length > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-700">
                            <AlertTriangle className="h-4 w-4" />
                            <div>
                                <p className="font-medium">{overdueInvoices.length} Overdue Invoice(s)</p>
                                <p className="text-sm">{formatCurrency(overdueAmount)} past due</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Invoice Count */}
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{invoices.length} Total Invoices</span>
                    </div>
                    <Button variant="link" className="p-0 h-auto" onClick={() => router.push(`/agent/invoices?client=${clientId}`)}>
                        View All <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
