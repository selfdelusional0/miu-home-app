import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert
} from "react-native";
import { databases, account, Query } from "@/lib/appwrite";

const DB_ID = "684f9da6001c19c3c9a0";
const FURNITURE_COLLECTION_ID = "684fab79000bd3a89fbc";
const ORDERS_COLLECTION_ID = "6855139600230701b5fc"; // Replace this

export default function OrderPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const session = await account.get();
                const uid = session.$id;
                setUserId(uid);

                const res = await databases.listDocuments(DB_ID, ORDERS_COLLECTION_ID, [
                    Query.equal("userId", uid),
                    Query.orderDesc("$createdAt")
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
                Alert.alert("Error", "Failed to load orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#5d8076" />
                <Text className="text-[#5d8076] mt-2">Loading orders...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white px-4 pt-10">
            <Text className="text-2xl font-bold text-[#5d8076] mb-4">My Orders</Text>

            {orders.map((order) => (
                <View key={order.$id} className="mb-4 p-4 border border-gray-300 rounded-xl bg-gray-50">
                    {order.product ? (
                        <View className="flex-row items-start space-x-4">
                            <Image
                                source={{ uri: order.product.image }}
                                className="w-20 h-20 rounded-lg mr-2"
                            />
                            <View className="flex-1">
                                <Text className="text-lg font-bold">{order.product.name}</Text>
                                <Text className="text-sm text-gray-600">{order.product.category}</Text>
                                <Text className="text-[#5d8076] font-semibold">RM {order.product.price}</Text>

                                <Text className="text-xs text-gray-500 mt-1">
                                    Status:
                                    <Text className={`font-semibold ml-1 ${
                                        order.status === "Delivered"
                                            ? "text-green-600"
                                            : order.status === "Shipped"
                                                ? "text-blue-600"
                                                : order.status === "cancelled"
                                                    ? "text-red-600"
                                                    : "text-yellow-600"
                                    }`}>
                                        {order.status}
                                    </Text>
                                </Text>

                                <Text className="text-xs mt-1 text-gray-500">Address: {order.address}, {order.postcode}, {order.city}</Text>
                                <Text className="text-xs text-gray-500">Payment: {order.paymentMethod}</Text>

                                {order.status === "pending" && (
                                    <Text
                                        className="text-sm text-red-500 mt-2 font-medium"
                                        onPress={() => {
                                            Alert.alert(
                                                "Cancel Order",
                                                "Are you sure you want to cancel this order?",
                                                [
                                                    { text: "No", style: "cancel" },
                                                    {
                                                        text: "Yes",
                                                        onPress: async () => {
                                                            try {
                                                                await databases.updateDocument(
                                                                    DB_ID,
                                                                    ORDERS_COLLECTION_ID,
                                                                    order.$id,
                                                                    { status: "cancelled" }
                                                                );
                                                                setOrders((prev) =>
                                                                    prev.map((o) =>
                                                                        o.$id === order.$id
                                                                            ? { ...o, status: "cancelled" }
                                                                            : o
                                                                    )
                                                                );
                                                            } catch (error) {
                                                                Alert.alert("Error", "Failed to cancel order.");
                                                            }
                                                        },
                                                    },
                                                ]
                                            );
                                        }}
                                    >
                                        Cancel Order
                                    </Text>
                                )}
                            </View>
                        </View>
                    ) : (
                        <Text className="text-gray-500">Product details not found</Text>
                    )}
                </View>
            ))}

        </ScrollView>
    );
}
