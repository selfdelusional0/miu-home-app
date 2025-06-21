import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { account, databases, ID } from "@/lib/appwrite";

const DB_ID = "684f9da6001c19c3c9a0";
const PROFILES_COLLECTION_ID = "684fa618002722712650";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert("Missing Fields", "Please fill in all fields.");
            return;
        }

        try {
            setLoading(true);

            // Create account
            await account.create(ID.unique(), email, password, name);

            // Auto-login
            await account.createEmailPasswordSession(email, password);

            // Get logged-in user
            const currentUser = await account.get();

            // Insert into profiles collection
            await databases.createDocument(
                DB_ID,
                PROFILES_COLLECTION_ID,
                currentUser.$id,
                {
                    name,
                    email,
                    password,
                    role: "user",
                }
            );

            Alert.alert("Registration Successful", "You are now logged in.");
            router.replace("/");
        } catch (err: any) {
            Alert.alert("Registration Failed", err?.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white justify-center px-6">
            <Text className="text-2xl text-center mb-8">Create your Miu Home account</Text>

            <TextInput
                placeholder="Full Name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
                className="border border-gray-300 rounded-xl p-4 mb-4 text-base"
            />

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
                onPress={handleRegister}
                className={`py-4 rounded-xl items-center ${loading ? "bg-gray-400" : "bg-[#5d8076]"}`}
                disabled={loading}
            >
                <Text className="text-white font-semibold text-base">
                    {loading ? "Registering..." : "Register"}
                </Text>
            </TouchableOpacity>

            <View className="mt-6 flex-row justify-center">
                <Text className="text-gray-600">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace("/login")}>
                    <Text className="text-[#5d8076] font-semibold">Log in</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
