import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Image
} from "react-native";
import {Query, databases, account} from "@/lib/appwrite";
import icons from "@/constants/icons";
import { useRouter } from "expo-router";

const DB_ID = "684f9da6001c19c3c9a0";
const ORDERS_COLLECTION_ID = "6855139600230701b5fc";
const FURNITURE_COLLECTION_ID = "684fab79000bd3a89fbc";

export default function AdminOrders() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    const toggleNav = () => setIsNavOpen(!isNavOpen);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await databases.listDocuments(DB_ID, ORDERS_COLLECTION_ID, [
                    Query.notEqual("status", "cancelled"),
                ]);
                const ordersWithProducts = await Promise.all(
                    res.documents.map(async (order) => {
                        try {
                            const product = await databases.getDocument(
                                DB_ID,
                                FURNITURE_COLLECTION_ID,
                                order.productId
                            );
                            return { ...order, product };
                        } catch {
                            return { ...order, product: null };
                        }
                    })
                );
                setOrders(ordersWithProducts);
            } catch (err) {
                Alert.alert("Error", "Failed to fetch orders.");
            } finally {
                setLoading(false);
            }
        };

        const checkSession = async () => {
            try {
                await account.get();
                setIsLoggedIn(true);
            } catch {
                setIsLoggedIn(false);
            }
        };

        checkSession();
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            await databases.updateDocument(DB_ID, ORDERS_COLLECTION_ID, orderId, {
                status: newStatus,
            });

            setOrders((prev) =>
                prev.map((order) =>
                    order.$id === orderId ? { ...order, status: newStatus } : order
                )
            );
            Alert.alert("Success", "Order status updated.");
        } catch (err) {
            Alert.alert("Error", "Failed to update status.");
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#5d8076" />
                <Text className="text-[#5d8076] mt-2">Loading orders...</Text>
            </View>
        );
    }

    const handleLogout = async () => {
        try {
            await account.deleteSession("current");
            setIsLoggedIn(false);
            toggleNav();
            router.replace("/");
        } catch (err) {
            console.log("Logout failed", err);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {isNavOpen && (
                <View className="absolute left-0 top-0 bottom-0 w-64 bg-gray-100 z-20 p-6 shadow-md">
                    {/* Header Row with Miu Home and Close Button */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-lg font-bold text-[#5d8076]">Miu Home</Text>
                        <TouchableOpacity onPress={toggleNav} className="p-2">
                            <Image source={icons.close} className="w-5 h-5" style={{ tintColor: "#5d8076" }} />
                        </TouchableOpacity>
                    </View>

                    {/* Navigation Links */}
                    <TouchableOpacity onPress={() => { router.replace("/admin"); toggleNav(); }} className="mb-4">
                        <Text className="text-xl text-[#5d8076]">Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { router.replace("/admin/stock"); toggleNav(); }} className="mb-4">
                        <Text className="text-xl text-[#5d8076]">View Stock</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { router.replace("/admin/order"); toggleNav(); }} className="mb-4">
                        <Text className="text-xl text-[#5d8076]">View Order</Text>
                    </TouchableOpacity>

                    {isLoggedIn ? (
                        <TouchableOpacity onPress={handleLogout} className="mb-4">
                            <Text className="text-xl text-[#5d8076]">Logout</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => { router.replace("/login"); toggleNav(); }} className="mb-4">
                            <Text className="text-xl text-[#5d8076]">Login</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <ScrollView className="flex-1 bg-white px-4 pt-10">
                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={toggleNav} className="mr-3">
                            <Image source={icons.menu} className="w-6 h-6" style={{ tintColor: "#5d8076" }} />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-[#5d8076]">All Orders</Text>
                    </View>
                </View>

                {orders.length === 0 ? (
                    <Text className="text-gray-500">No orders found.</Text>
                ) : (
                    orders.map((order) => (
                        <View
                            key={order.$id}
                            className="mb-4 p-4 border border-gray-300 rounded-xl bg-gray-50"
                        >
                            {order.product ? (
                                <View className="flex-row items-center space-x-4">
                                    <Image
                                        source={{ uri: order.product.image }}
                                        className="w-20 h-20 rounded-lg mr-2"
                                    />
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold">{order.product.name}</Text>
                                        <Text className="text-sm text-gray-600">{order.product.category}</Text>
                                        <Text className="text-[#5d8076] font-semibold">RM {order.product.price}</Text>

                                        <Text className="text-xs mt-1 text-gray-500">
                                            Status:
                                            <Text className={`font-semibold ml-1 ${
                                                order.status === "delivered"
                                                    ? "text-green-600"
                                                    : order.status === "shipped"
                                                        ? "text-blue-600"
                                                        : "text-yellow-600"
                                            }`}>
                                                {order.status}
                                            </Text>
                                        </Text>

                                        <Text className="text-xs text-gray-500 mt-1">
                                            Address: {order.address}, {order.postcode}, {order.city}
                                        </Text>
                                        <Text className="text-xs text-gray-500">Payment: {order.paymentMethod}</Text>

                                        {/* Status Update Buttons */}
                                        <View className="flex-row mt-2 space-x-2">
                                            {["pending", "shipped", "delivered"].map((status) => (
                                                <TouchableOpacity
                                                    key={status}
                                                    className={`px-3 py-1 rounded-full border ${
                                                        order.status === status
                                                            ? "bg-[#5d8076] border-[#5d8076]"
                                                            : "border-gray-300"
                                                    }`}
                                                    onPress={() => handleStatusUpdate(order.$id, status)}
                                                >
                                                    <Text
                                                        className={`text-sm ${
                                                            order.status === status
                                                                ? "text-white"
                                                                : "text-gray-700"
                                                        }`}
                                                    >
                                                        {status}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <Text className="text-gray-500">Product info not found</Text>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </View>

    );
}
