import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from "react-native";
import { account, databases, Query } from "@/lib/appwrite";
import icons from "@/constants/icons";
import { useRouter } from "expo-router";
import { formatPrice } from "@/utils/format";

const DB_ID = "684f9da6001c19c3c9a0";
const ORDERS_COLLECTION_ID = "6855139600230701b5fc";
const FURNITURE_COLLECTION_ID = "684fab79000bd3a89fbc";

export default function AdminDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                await account.get();
                setIsLoggedIn(true);
            } catch {
                setIsLoggedIn(false);
            }
            await loadOrders();
        })();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await databases.listDocuments(DB_ID, ORDERS_COLLECTION_ID, [
                Query.notEqual("status", "cancelled"),
            ]);

            const detailed = await Promise.all(
                res.documents.map(async order => {
                    try {
                        const product = await databases.getDocument(
                            DB_ID, FURNITURE_COLLECTION_ID, order.productId
                        );
                        return { ...order, product };
                    } catch {
                        return { ...order, product: null };
                    }
                })
            );

            setOrders(detailed);
        } catch (err) {
            Alert.alert("Error", "Failed to load orders.");
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await account.deleteSession("current");
        setIsLoggedIn(false);
        setIsNavOpen(false);
        router.replace("/");
    };

    const { total, monthly, yearly, byCategory } = (() => {
        const total = orders.reduce((s, o) => s + parseFloat(o?.product?.price || 0), 0);
        const nowY = new Date().getFullYear();

        const monthly: Record<string, number> = {};
        let yearly = 0;
        const byCategory: Record<string, number> = {};

        orders.forEach(o => {
            const prod = o.product;
            if (!prod) return;

            const date = new Date(o.$createdAt);
            const key = date.toLocaleString("default", { month: "long", year: "numeric" });
            const price = parseFloat(prod.price) || 0;

            monthly[key] = (monthly[key] || 0) + price;
            if (date.getFullYear() === nowY) yearly += price;

            byCategory[prod.category || "Uncategorized"] =
                (byCategory[prod.category] || 0) + price;
        });

        return { total, monthly, yearly, byCategory };
    })();

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#5d8076" />
                <Text className="text-[#5d8076] mt-2">Loading dashboard…</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {isNavOpen && (
                <View className="absolute left-0 top-0 bottom-0 w-64 bg-gray-100 z-20 p-6 shadow-md">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-lg font-bold text-[#5d8076]">Miu Home</Text>
                        <TouchableOpacity onPress={() => setIsNavOpen(false)} className="p-2">
                            <Image source={icons.close} className="w-5 h-5" style={{ tintColor: "#5d8076" }} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => {router.replace("/admin");setIsNavOpen(false)}} className="mb-4">
                        <Text className="text-xl text-[#5d8076]">Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {router.replace("/admin/stock");setIsNavOpen(false)}} className="mb-4">
                        <Text className="text-xl text-[#5d8076]">View Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {router.replace("/admin/order");setIsNavOpen(false)}} className="mb-4">
                        <Text className="text-xl text-[#5d8076]">View Order</Text>
                    </TouchableOpacity>
                    {isLoggedIn ? (
                        <TouchableOpacity onPress={handleLogout} className="mb-4">
                            <Text className="text-xl text-[#5d8076]">Logout</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => {router.replace("/login");setIsNavOpen(false)}} className="mb-4">
                            <Text className="text-xl text-[#5d8076]">Login</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <ScrollView className="flex-1 px-4 pt-10">
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => setIsNavOpen(true)} className="mr-3">
                        <Image source={icons.menu} className="w-6 h-6" style={{ tintColor: "#5d8076" }} />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-[#5d8076]">Dashboard</Text>
                </View>

                <View className="mb-6 bg-gray-100 p-4 rounded-2xl">
                    <Text className="text-xl font-bold text-[#5d8076] mb-4">Sales by Month</Text>

                    {Object.entries(monthly).map(([month, amt]) => (
                        <View
                            key={month}
                            className="flex-row justify-between items-center border-b border-gray-200 py-2"
                        >
                            <Text className="text-gray-700 text-base">{month}</Text>
                            <Text className="text-base font-semibold text-[#5d8076]">RM {formatPrice(amt)}</Text>
                        </View>
                    ))}
                </View>

                <View className="mb-6 bg-gray-100 p-4 rounded-2xl">
                    <Text className="text-xl font-bold text-[#5d8076] mb-4">Sales by Category</Text>

                    {Object.entries(byCategory).map(([cat, amt]) => (
                        <View
                            key={cat}
                            className="flex-row justify-between items-center border-b border-gray-200 py-2"
                        >
                            <Text className="text-gray-700 text-base capitalize">{cat}</Text>
                            <Text className="text-base font-semibold text-[#5d8076]">RM {formatPrice(amt)}</Text>
                        </View>
                    ))}
                </View>

                <View className="mb-6 bg-gray-100 p-4 rounded-xl">
                    <Text className="text-lg text-gray-700">Sales This Year</Text>
                    <Text className="text-xl font-bold text-[#5d8076]">RM {formatPrice(yearly)}</Text>
                </View>

                <View className="mb-6 bg-gray-100 p-4 rounded-xl">
                    <Text className="text-lg text-gray-700">Total Sales</Text>
                    <Text className="text-xl font-bold text-[#5d8076]">RM {formatPrice(total)}</Text>
                </View>
            </ScrollView>
        </View>
    );
}
