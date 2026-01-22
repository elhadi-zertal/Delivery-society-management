"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DateRangePickerProps {
    value: string;
    onChange: (value: string) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    return (
        <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">Time Range:</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">Last Month</SelectItem>
                    <SelectItem value="3">Last 3 Months</SelectItem>
                    <SelectItem value="6">Last 6 Months</SelectItem>
                    <SelectItem value="12">Last 12 Months</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
