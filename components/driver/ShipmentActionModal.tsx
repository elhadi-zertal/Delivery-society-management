"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { IShipment, ShipmentStatus } from "@/types";
import { Camera, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { fileToBase64 } from "@/lib/utils/file";
import Image from 'next/image';

const shipmentStatusSchema = z.object({
  status: z.enum([
    ShipmentStatus.DELIVERED,
    ShipmentStatus.FAILED_DELIVERY,
    ShipmentStatus.PENDING,
    ShipmentStatus.CANCELLED,
  ]),
  notes: z.string().optional(),
  receiverName: z.string().optional(),
});

type ShipmentFormValues = z.infer<typeof shipmentStatusSchema>;

interface ShipmentActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: IShipment | null;
  onUpdate: (updatedShipment: IShipment) => void;
}

export function ShipmentActionModal({ isOpen, onClose, shipment, onUpdate }: ShipmentActionModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentStatusSchema),
    defaultValues: {
      status: shipment?.status as any || ShipmentStatus.DELIVERED,
      notes: '',
      receiverName: '',
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newAttachments: string[] = [];
      for (const file of Array.from(files)) {
        const base64 = await fileToBase64(file);
        const uploadRes = await apiClient.upload.file(base64, 'pod');
        newAttachments.push(uploadRes.url);
      }
      setAttachments([...attachments, ...newAttachments]);
      toast.success("Photos uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload photos");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit: SubmitHandler<ShipmentFormValues> = async (values) => {
    if (!shipment) return;
    setSubmitting(true);

    try {
      const payload = {
        ...values,
        proofOfDelivery: attachments.length > 0 ? {
          photos: attachments,
          signature: '', // We could add a signature pad later
          timestamp: new Date().toISOString(),
        } : undefined,
      };

      const response = await apiClient.shipments.updateStatus(shipment._id.toString(), payload);
      toast.success(`Shipment marked as ${values.status.toLowerCase()}`);
      onUpdate(response.data);
      onClose();
      form.reset();
      setAttachments([]);
    } catch (error) {
      toast.error("Failed to update shipment status");
    } finally {
      setSubmitting(false);
    }
  };

  if (!shipment) return null;

  const currentStatus = form.watch('status');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-black italic tracking-tighter uppercase">Update Shipment</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Set the final status for this delivery stop.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-900/50 border-zinc-800 h-12 rounded-2xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      <SelectItem value={ShipmentStatus.DELIVERED} className="focus:bg-green-500/10 focus:text-green-500">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Delivered</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={ShipmentStatus.FAILED_DELIVERY} className="focus:bg-red-500/10 focus:text-red-500">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>Failed / Refused</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={ShipmentStatus.PENDING} className="focus:bg-zinc-800 focus:text-zinc-100">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-zinc-400" />
                          <span>Pending / Back to Depot</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {currentStatus === ShipmentStatus.DELIVERED && (
              <FormField
                control={form.control}
                name="receiverName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Received By</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Name of person who received the delivery" 
                        {...field} 
                        className="bg-zinc-900/50 border-zinc-800 h-12 rounded-2xl focus-visible:ring-green-500/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Notes / Reason</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any relevant information about the delivery..." 
                      className="bg-zinc-900/50 border-zinc-800 rounded-2xl min-h-[100px] resize-none focus-visible:ring-green-500/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Proof of Delivery (Photos)</p>
              <div className="grid grid-cols-3 gap-2">
                {attachments.map((url, index) => (
                  <div key={index} className="aspect-square relative rounded-xl overflow-hidden border border-zinc-800 group">
                    <Image src={url} alt={`POD ${index}`} fill className="object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl hover:bg-zinc-900/50 cursor-pointer transition-colors">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-6 w-6 text-zinc-500" />
                      <span className="text-[8px] font-bold uppercase mt-1 text-zinc-600">Add Photo</span>
                    </>
                  )}
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl h-12">Cancel</Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white rounded-2xl h-12 px-8 flex-1 sm:flex-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Confirm Update'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
