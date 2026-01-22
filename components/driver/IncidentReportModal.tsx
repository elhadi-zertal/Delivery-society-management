"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { IncidentType } from '@/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Camera, X, Loader2 } from 'lucide-react';
import { fileToBase64 } from '@/lib/utils/file';

const incidentFormSchema = z.object({
    type: z.nativeEnum(IncidentType),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.string().optional(),
    occurredAt: z.string(),
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

interface IncidentReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    tourId: string;
    shipmentId?: string;
    vehicleId?: string;
}

export function IncidentReportModal({ isOpen, onClose, tourId, shipmentId, vehicleId }: IncidentReportModalProps) {
    const [photos, setPhotos] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<IncidentFormValues>({
        resolver: zodResolver(incidentFormSchema),
        defaultValues: {
            type: IncidentType.OTHER,
            occurredAt: new Date().toISOString(),
            description: '',
            location: '',
        }
    });

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const base64 = await fileToBase64(files[i]);
                const result: any = await apiClient.upload.file(base64, 'incidents');
                uploadedUrls.push(result.data.secureUrl);
            }
            setPhotos(prev => [...prev, ...uploadedUrls]);
            toast.success(`${files.length} photo(s) uploaded`);
        } catch (error) {
            toast.error("Failed to upload photos");
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit: SubmitHandler<IncidentFormValues> = async (values) => {
        setSubmitting(true);
        try {
            const payload = {
                ...values,
                deliveryTour: tourId,
                shipment: shipmentId,
                vehicle: vehicleId,
                photos: photos,
                occurredAt: new Date(values.occurredAt),
            };

            await apiClient.incidents.create(payload);
            toast.success("Incident reported successfully");
            reset();
            setPhotos([]);
            onClose();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to report incident");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-[#111111] border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Report Incident</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Incident Type</Label>
                        <Select onValueChange={(val) => setValue('type', val as IncidentType)}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                {Object.values(IncidentType).map((type) => (
                                    <SelectItem key={type} value={type} className="capitalize">{type.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location (Optional)</Label>
                        <Input 
                            id="location" 
                            {...register('location')}
                            placeholder="e.g. Near Downtown Exit"
                            className="bg-zinc-900 border-zinc-800"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                            id="description" 
                            {...register('description')}
                            placeholder="Describe what happened..."
                            className="bg-zinc-900 border-zinc-800 min-h-[100px]"
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label>Photos ({photos.length})</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {photos.map((url, i) => (
                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 group">
                                    <img src={url} alt="Incident" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => removePhoto(i)}
                                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square flex flex-col items-center justify-center border border-dashed border-zinc-700 rounded-lg hover:border-zinc-500 transition-colors cursor-pointer bg-zinc-900/50">
                                {uploading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                                ) : (
                                    <>
                                        <Camera className="h-6 w-6 text-zinc-500" />
                                        <span className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-tighter">Add</span>
                                    </>
                                )}
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
                        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={submitting || uploading}>
                            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Submit Report
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
