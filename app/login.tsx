import { Image, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { account, databases, Query } from "@/lib/appwrite";
import icons from "@/constants/icons";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const DB_ID = "684f9da6001c19c3c9a0";
    const PROFILES_COLLECTION_ID = "684fa618002722712650";

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Missing Fields", "Please enter both email and password.");
            return;
        }

        try {
            setLoading(true);

            await account.createEmailPasswordSession(email, password);

            const currentUser = await account.get();
            const res = await databases.listDocuments(DB_ID, PROFILES_COLLECTION_ID, [
                Query.equal("email", currentUser.email)
            ]);

            const profile = res.documents[0];

            if (!profile) {
                Alert.alert("No profile found.");
                return;
            }

            if (profile.role === "admin") {
                router.replace("/admin");
                return;
            } else {
                router.replace("/");
                return;
            }

            Alert.alert("Login Successful");
        } catch (err: any) {
            Alert.alert("Login Failed", err?.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white justify-center items-center px-6">
            <View className="w-full max-w-md">
                <View className="items-center mb-6">
                    <Image source={icons.logo} className="w-48 h-48" resizeMode="contain" />
                    <Text className="text-2xl text-center mb-8">Welcome back to Miu Home</Text>
                </View>

                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#888"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="border border-gray-300 rounded-xl p-4 mb-4 text-base"
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    className="border border-gray-300 rounded-xl p-4 mb-6 text-base"
                />

                <TouchableOpacity
                    onPress={handleLogin}
                    className={`py-4 rounded-xl items-center ${loading ? "bg-gray-400" : "bg-[#5d8076]"}`}
                    disabled={loading}
                >
                    <Text className="text-white font-semibold text-base">
                        {loading ? "Logging in..." : "Log In"}
                    </Text>
                </TouchableOpacity>

                {/* Sign up prompt */}
                <View className="mt-6 flex-row justify-center">
                    <Text className="text-gray-600">Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.replace("/register")}>
                        <Text className="text-[#5d8076] font-semibold">Sign up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
