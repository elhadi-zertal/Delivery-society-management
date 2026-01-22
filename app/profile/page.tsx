"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function ProfilePage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    const user = session?.user || { name: "User", email: "user@example.com", image: null };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("Profile updated");
        }, 1000);
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl space-y-6">
            <h1 className="text-3xl font-bold">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1">
                    <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback className="text-2xl">
                                {user.name?.[0] || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-semibold text-lg">{user.name}</h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Button variant="outline" className="w-full">Change Photo</Button>
                    </CardContent>
                </Card>

                <div className="md:col-span-3">
                    <Tabs defaultValue="account">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="account">Account Details</TabsTrigger>
                            <TabsTrigger value="preferences">Preferences</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                        </TabsList>

                        <TabsContent value="account" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>Update your contact details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <Input defaultValue={user.name || ""} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone Number</Label>
                                            <Input placeholder="+1 234..." />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input defaultValue={user.email || ""} disabled />
                                        <p className="text-xs text-muted-foreground">Contact support to change email</p>
                                    </div>
                                    <Button onClick={handleSave} disabled={loading}>Save Changes</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="preferences" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>App Preferences</CardTitle>
                                    <CardDescription>Customize your experience</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Receive weekly digests</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label>Language</Label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option>English</option>
                                            <option>French</option>
                                            <option>Arabic</option>
                                        </select>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Password & Security</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Current Password</Label>
                                        <Input type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <Input type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm Password</Label>
                                        <Input type="password" />
                                    </div>
                                    <Button onClick={handleSave}>Update Password</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
