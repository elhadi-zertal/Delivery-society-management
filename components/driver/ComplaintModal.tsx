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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { ComplaintNature } from '@/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Loader2, Paperclip, X } from 'lucide-react';
import { fileToBase64 } from '@/lib/utils/file';

const complaintFormSchema = z.object({
    nature: z.nativeEnum(ComplaintNature),
    description: z.string().min(10, "Description must be at least 10 characters"),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

type ComplaintFormValues = z.infer<typeof complaintFormSchema>;

interface ComplaintModalProps {
    isOpen: boolean;
    onClose: () => void;
    tourId: string;
}

export function ComplaintModal({ isOpen, onClose, tourId }: ComplaintModalProps) {
    const [attachments, setAttachments] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<ComplaintFormValues>({
        resolver: zodResolver(complaintFormSchema),
        defaultValues: {
            nature: ComplaintNature.OTHER,
            priority: 'medium',
        }
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const base64 = await fileToBase64(files[i]);
                const result: any = await apiClient.upload.file(base64, 'complaints');
                uploadedUrls.push(result.data.secureUrl);
            }
            setAttachments(prev => [...prev, ...uploadedUrls]);
            toast.success("Attachment(s) added");
        } catch (error) {
            toast.error("Failed to upload attachments");
        } finally {
            setUploading(false);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit: SubmitHandler<ComplaintFormValues> = async (values) => {
        setSubmitting(true);
        try {
            const payload = {
                ...values,
                deliveryTour: tourId,
                attachments,
            };

            await apiClient.complaints.create(payload);
            toast.success("Complaint submitted successfully");
            reset();
            setAttachments([]);
            onClose();
        } catch (error) {
            toast.error("Failed to submit complaint");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-[#111111] border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Submit Complaint</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="nature">Nature of Complaint</Label>
                        <Select onValueChange={(val) => setValue('nature', val as ComplaintNature)}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Select nature" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                {Object.values(ComplaintNature).map((nature) => (
                                    <SelectItem key={nature} value={nature} className="capitalize">{nature.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.nature && <p className="text-xs text-red-500">{errors.nature.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select onValueChange={(val) => setValue('priority', val as any)}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                            id="description" 
                            {...register('description')}
                            placeholder="Provide details about the issue..."
                            className="bg-zinc-900 border-zinc-800 min-h-[120px]"
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label>Attachments ({attachments.length})</Label>
                        <div className="space-y-2">
                            {attachments.map((url, i) => (
                                <div key={i} className="flex items-center justify-between bg-zinc-900/50 p-2 rounded-lg border border-zinc-800 group">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Paperclip className="h-3 w-3 text-zinc-500" />
                                        <span className="text-xs text-zinc-400 truncate max-w-[200px]">{url.split('/').pop()}</span>
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-zinc-500 hover:text-red-400"
                                        onClick={() => removeAttachment(i)}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                            <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-zinc-700 rounded-lg hover:border-zinc-500 transition-colors cursor-pointer bg-zinc-900/50">
                                {uploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                ) : (
                                    <>
                                        <Paperclip className="h-4 w-4 text-zinc-500" />
                                        <span className="text-sm text-zinc-500">Attach files</span>
                                    </>
                                )}
                                <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
                        <Button type="submit" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" disabled={submitting || uploading}>
                            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Submit Complaint
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
