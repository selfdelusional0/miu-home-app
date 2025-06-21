import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { account, databases, ID } from "@/lib/appwrite";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DB_ID = "684f9da6001c19c3c9a0";
const FURNITURE_COLLECTION_ID = "684fab79000bd3a89fbc";
const ORDERS_COLLECTION_ID = "6855139600230701b5fc";

export default function PaymentPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [address, setAddress] = useState("");
    const [postcode, setPostcode] = useState("");
    const [city, setCity] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
    const [loading, setLoading] = useState(false);
    const { cart, source } = useLocalSearchParams();
    const cartItems = cart ? JSON.parse(decodeURIComponent(cart)) : [];

    const handleConfirm = async () => {
        if (!address || !postcode || !city) {
            Alert.alert("Missing Info", "Please fill in all delivery details.");
            return;
        }

        try {
            setLoading(true);
            const user = await account.get();
            const userId = user.$id;

            for (const item of cartItems) {
                const product = await databases.getDocument(DB_ID, FURNITURE_COLLECTION_ID, item.id);

                await databases.updateDocument(DB_ID, FURNITURE_COLLECTION_ID, item.id, {
                    quantity: (product.quantity || 1) - 1
                });

                await databases.createDocument(DB_ID, ORDERS_COLLECTION_ID, ID.unique(), {
                    userId,
                    productId: item.id,
                    address,
                    postcode,
                    city,
                    paymentMethod,
                    status: "pending",
                });
            }

            Alert.alert("Success", "Order(s) placed successfully.");
            if (source === "cart") {
                await AsyncStorage.removeItem("cart");
            }
            router.replace("/");
        } catch (error) {
            Alert.alert("Error", "Failed to place order(s).");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white px-4 pt-10">
            <Text className="text-2xl font-bold text-[#5d8076] mb-6">Delivery Information</Text>

            <TextInput
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor="#888"
                className="border border-gray-300 rounded-xl p-4 mb-4"
            />

            <TextInput
                placeholder="Postcode"
                value={postcode}
                onChangeText={setPostcode}
                placeholderTextColor="#888"
                keyboardType="numeric"
                className="border border-gray-300 rounded-xl p-4 mb-4"
            />

            <TextInput
                placeholder="City"
                value={city}
                placeholderTextColor="#888"
                onChangeText={setCity}
                className="border border-gray-300 rounded-xl p-4 mb-6"
            />

            <Text className="text-xl font-semibold text-[#5d8076] mb-2">Payment Method</Text>
            {["Credit Card", "Online Banking", "Cash on Delivery"].map((method) => (
                <TouchableOpacity
                    key={method}
                    onPress={() => setPaymentMethod(method)}
                    className={`border p-4 rounded-xl mb-3 ${
                        paymentMethod === method ? "border-[#5d8076]" : "border-gray-300"
                    }`}
                >
                    <Text className="text-base">{method}</Text>
                </TouchableOpacity>
            ))}

            <TouchableOpacity
                onPress={handleConfirm}
                className={`py-4 rounded-xl items-center ${loading ? "bg-gray-400" : "bg-[#5d8076]"}`}
                disabled={loading}
            >
                <Text className="text-white font-semibold text-base">
                    {loading ? "Placing Order..." : "Confirm Order"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
