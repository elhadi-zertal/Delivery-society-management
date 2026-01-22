"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FileDown, Table, BarChart as BarChartIcon, Settings } from "lucide-react";

export default function CustomReportPage() {
    const [reportType, setReportType] = useState("");

    const handleGenerate = () => {
        toast.info("Custom report generation started...");
        // This would connect to a generic query API in a real implementation
        setTimeout(() => toast.success("Report generated! Check your email."), 1500);
    };

    return (
        <div className="container mx-auto py-6 space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold">Custom Report Builder</h1>
                <p className="text-muted-foreground">Design and generate tailored reports for specific needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                        <CardDescription>Select data sources and filters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Report Type</Label>
                            <Select value={reportType} onValueChange={setReportType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select report type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="shipments">Shipments Detail</SelectItem>
                                    <SelectItem value="clients">Client Performance</SelectItem>
                                    <SelectItem value="financial">Financial Ledger</SelectItem>
                                    <SelectItem value="drivers">Driver Logs</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {reportType && (
                            <>
                                <div className="space-y-2">
                                    <Label>Metrics Included</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="m1" defaultChecked />
                                            <Label htmlFor="m1">Total Count</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="m2" defaultChecked />
                                            <Label htmlFor="m2">Revenue / Amount</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="m3" />
                                            <Label htmlFor="m3">Success Rate</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="m4" />
                                            <Label htmlFor="m4">Wait Time</Label>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date Range</Label>
                                        <Select defaultValue="30">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="30">Last 30 Days</SelectItem>
                                                <SelectItem value="90">Last Quarter</SelectItem>
                                                <SelectItem value="365">Last Year</SelectItem>
                                                <SelectItem value="custom">Custom Range</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Format</Label>
                                        <Select defaultValue="pdf">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pdf">PDF Document</SelectItem>
                                                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                                                <SelectItem value="csv">CSV Data</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Visualization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className="h-20 flex-col gap-2">
                                    <Table className="h-6 w-6" />
                                    Table
                                </Button>
                                <Button variant="outline" className="h-20 flex-col gap-2">
                                    <BarChartIcon className="h-6 w-6" />
                                    Chart
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Button size="lg" className="w-full" disabled={!reportType} onClick={handleGenerate}>
                        <Settings className="h-4 w-4 mr-2" />
                        Generate Report
                    </Button>
                </div>
            </div>
        </div>
    );
}
