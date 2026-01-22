"use client";

import { useState } from "react";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck } from "lucide-react";

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left: Branding & Info */}
            <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
                <div className="flex items-center gap-2 text-2xl font-bold">
                    <Truck className="h-8 w-8" />
                    <span>TransLogistics</span>
                </div>
                <div className="space-y-4">
                    <h1 className="text-5xl font-bold leading-tight">
                        Manage your transport fleet efficiently.
                    </h1>
                    <p className="text-lg opacity-90">
                        Join thousands of drivers and agents using our platform to streamline deliveries and logistics.
                    </p>
                </div>
                <div className="text-sm opacity-75">
                    © 2026 TransLogistics Inc. All rights reserved.
                </div>
            </div>

            {/* Right: Auth Forms */}
            <div className="flex items-center justify-center p-6 bg-muted/20">
                <Card className="w-full max-w-md border-0 shadow-lg sm:border sm:shadow-sm">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-center lg:hidden mb-4 text-primary">
                            <Truck className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">
                            {activeTab === "signin" ? "Welcome back" : "Create an account"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {activeTab === "signin"
                                ? "Enter your email to sign in to your account"
                                : "Enter your information to create an account"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="signin">Sign In</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>
                            <TabsContent value="signin">
                                <SignInForm />
                            </TabsContent>
                            <TabsContent value="signup">
                                <SignUpForm onSwitch={() => setActiveTab("signin")} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
