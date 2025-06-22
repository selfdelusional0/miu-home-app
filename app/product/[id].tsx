import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { databases, account } from "@/lib/appwrite";
import icons from "@/constants/icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {formatPrice} from "@/utils/format";

const DB_ID = "684f9da6001c19c3c9a0";
const FURNITURE_COLLECTION_ID = "684fab79000bd3a89fbc";

export default function ProductDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const toggleNav = () => setIsNavOpen(!isNavOpen);

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

    useEffect(() => {
        const checkSession = async () => {
            try {
                await account.get();
                setIsLoggedIn(true);
            } catch {
                setIsLoggedIn(false);
            }
        };

        const fetchProduct = async () => {
            try {
                const doc = await databases.getDocument(DB_ID, FURNITURE_COLLECTION_ID, String(id));
                setProduct(doc);
            } catch (err) {
                Alert.alert("Error", "Failed to load product.");
                router.replace("/");
            } finally {
                setLoading(false);
            }
        };

        checkSession();
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#5d8076" />
                <Text className="text-[#5d8076] mt-2">Loading product...</Text>
            </View>
        );
    }

    if (!product) {
        return (
            <View className="flex-1 justify-center items-center bg-white px-6">
                <Text className="text-center text-gray-500">Product not found.</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {/* Navigation Panel */}
            {isNavOpen && (
                <View className="absolute left-0 top-0 bottom-0 w-64 bg-gray-100 z-20 p-6 shadow-md">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-lg font-bold text-[#5d8076]">Miu Home</Text>
                        <TouchableOpacity onPress={toggleNav} className="p-2">
                            <Image source={icons.close} className="w-5 h-5" style={{ tintColor: "#5d8076" }} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => { router.replace("/"); toggleNav(); }} className="mb-4">
                        <Text className="text-xl text-[#5d8076]">Home</Text>
                    </TouchableOpacity>

                    {isLoggedIn ? (
                        <View>
                            <TouchableOpacity onPress={() => { router.replace("/favourite"); toggleNav(); }} className="mb-4">
                                <Text className="text-xl text-[#5d8076]">Favourite</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { router.replace("/order"); toggleNav(); }} className="mb-4">
                                <Text className="text-xl text-[#5d8076]">Order</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleLogout} className="mb-4">
                                <Text className="text-xl text-[#5d8076]">Logout</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => { router.replace("/login"); toggleNav(); }} className="mb-4">
                            <Text className="text-xl text-[#5d8076]">Login</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Product Content */}
            <ScrollView className="flex-1 p-4">
                {/*<View className="flex-row items-center mb-4">*/}
                {/*    <TouchableOpacity onPress={toggleNav} className="mr-3">*/}
                {/*        <Image source={icons.menu} className="w-6 h-6" style={{ tintColor: "#5d8076" }} />*/}
                {/*    </TouchableOpacity>*/}
                {/*    <Text className="text-2xl font-bold text-[#5d8076] flex-shrink">{product.name}</Text>*/}
                {/*</View>*/}

                <Image
                    source={{ uri: product.image }}
                    className="w-full h-64 rounded-xl mb-4"
                    resizeMode="cover"
                />

                <Text className="text-3xl font-bold mb-1">{product.name}</Text>
                <Text className="text-gray-500 text-xl mb-2">{product.category}</Text>
                <Text className="text-gray-500 text-xl mb-2">Quantity: {product.quantity}</Text>
                <Text className="text-2xl font-semibold text-[#5d8076] mb-4">RM {formatPrice(product.price)}</Text>

                <Text className="text-xl text-gray-800">{product.description}</Text>

                <View className="flex-row justify-between items-center mt-6">
                    <TouchableOpacity
                        className="flex-1 items-center bg-[#5d8076] py-4 rounded-full"
                        onPress={async () => {
                            try {
                                const existing = await AsyncStorage.getItem("favorites");
                                const favorites = existing ? JSON.parse(existing) : [];

                                const isAlreadyFavorite = favorites.some((item) => item.$id === product.$id);
                                if (isAlreadyFavorite) {
                                    Alert.alert("Info", "This item is already in your favorites.");
                                    return;
                                }

                                favorites.push(product);
                                await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
                                Alert.alert("Success", "Item added to favorites!");
                            } catch (error) {
                                console.error("Failed to add to favorites:", error);
                                Alert.alert("Error", "Could not add item to favorites.");
                            }
                        }}
                    >
                        <Text className="text-white font-semibold">❤️</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 items-center bg-[#5d8076] py-4 rounded-full ml-2"
                        onPress={async () => {
                            try {
                                const existing = await AsyncStorage.getItem("cart");
                                const cart = existing ? JSON.parse(existing) : [];

                                // Optional: avoid adding the same item twice
                                const isAlreadyInCart = cart.some((item) => item.$id === product.$id);
                                if (isAlreadyInCart) {
                                    Alert.alert("Info", "This item is already in your cart.");
                                    return;
                                }

                                cart.push(product);
                                await AsyncStorage.setItem("cart", JSON.stringify(cart));
                                Alert.alert("Success", "Item added to cart!");
                            } catch (error) {
                                console.error("Failed to add to cart:", error);
                                Alert.alert("Error", "Could not add item to cart.");
                            }
                        }}
                    >
                        <Text className="text-white font-semibold">Add to Cart</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 items-center bg-[#5d8076] py-4 rounded-full ml-2"
                        onPress={async () => {
                            try {
                                await account.get();

                                router.push({
                                    pathname: "/payment",
                                    params: {
                                        cart: encodeURIComponent(JSON.stringify([
                                            {
                                                id: product.$id,
                                                name: product.name,
                                                price: product.price,
                                                image: product.image,
                                                source: "single",
                                            },
                                        ])),
                                    },
                                });
                            } catch {
                                Alert.alert("Login Required", "Please log in to proceed with purchase.");
                                router.replace("/login"); // Redirect to login
                            }
                        }}
                    >
                        <Text className="text-white font-bold">Buy Now</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
