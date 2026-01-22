"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import { ArrowLeft, Loader2, Save } from "lucide-react";

const userFormSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    role: z.enum(["admin", "agent", "driver"]),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    confirmPassword: z.string().optional(),
    isActive: z.boolean(),
    // Driver specific
    licenseNumber: z.string().optional(),
    licenseType: z.string().optional(),
    licenseExpiryDate: z.string().optional(),
    // Agent specific
    department: z.string().optional(),
    employeeId: z.string().optional(),
}).refine((data) => {
    if (data.role === 'driver') {
        return !!data.licenseNumber && !!data.licenseType;
    }
    return true;
}, {
    message: "License details are required for drivers",
    path: ["licenseNumber"]
}).refine((data) => {
    if (data.password && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export default function CreateUserPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof userFormSchema>>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            role: "agent",
            password: "",
            confirmPassword: "",
            isActive: true,
            licenseNumber: "",
            licenseType: "",
            licenseExpiryDate: "",
            department: "",
            employeeId: "",
        },
    });

    const watchedRole = form.watch("role");

    async function onSubmit(values: any) {
        setLoading(true);
        try {
            await adminApi.createUser(values);
            toast.success("User created successfully");
            router.push("/admin/users");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create user");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto py-6 max-w-3xl">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Create New User</h1>
                    <p className="text-muted-foreground">Add a new user to the system</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Basic details about the user</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="john@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="+213..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account & Role</CardTitle>
                            <CardDescription>Access level and authentication</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 md:h-10">
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="agent">Agent</SelectItem>
                                                <SelectItem value="driver">Driver</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            {field.value === 'admin' && "Full system access including user management."}
                                            {field.value === 'agent' && "Can manage shipments, clients, and view standard reports."}
                                            {field.value === 'driver' && "Limited access to assigned tours and deliveries."}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="h-6 w-6 md:h-4 md:w-4"
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-base md:text-sm">
                                                Active Account
                                            </FormLabel>
                                            <FormDescription>
                                                Uncheck to suspend user access immediately.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {watchedRole === 'driver' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Driver Details</CardTitle>
                                <CardDescription>License and qualification information</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="licenseNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>License Number</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="licenseType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>License Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 md:h-10">
                                                        <SelectValue placeholder="type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="B">B (Car)</SelectItem>
                                                    <SelectItem value="C">C (Truck)</SelectItem>
                                                    <SelectItem value="D">D (Bus)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="licenseExpiryDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>License Expiry</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 pb-12 sm:pb-0 sticky bottom-0 bg-background/95 backdrop-blur sm:static sm:bg-transparent border-t sm:border-t-0 -mx-4 px-4 sm:mx-0 sm:px-0 z-10 transition-all">
                        <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading} loading={loading}>
                            Create User
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
