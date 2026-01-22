"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/lib/validations/schemas";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { UserRole } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

type SignUpValues = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
    onSwitch: () => void;
}

export function SignUpForm({ onSwitch }: SignUpFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            role: UserRole.DRIVER
        }
    });

    const onSubmit = async (data: SignUpValues) => {
        setIsLoading(true);
        try {
            await apiClient.auth.signUp(data);
            toast.success("Registration submitted!", {
                description: "Your account is pending admin approval."
            });
            onSwitch();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    placeholder="John Doe"
                    disabled={isLoading}
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@example.com"
                    disabled={isLoading}
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...register("password")}
                        className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                        <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...register("confirmPassword")}
                        className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && (
                        <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                    id="role"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("role")}
                    disabled={isLoading}
                >
                    <option value={UserRole.DRIVER}>Driver</option>
                    <option value={UserRole.AGENT}>Agent</option>
                </select>
                {errors.role && (
                    <p className="text-sm text-red-500">{errors.role.message}</p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
            </Button>
        </form>
    );
}
