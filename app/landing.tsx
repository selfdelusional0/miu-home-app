import { useEffect } from "react";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { account, databases } from "@/lib/appwrite";
import icons from "@/constants/icons";

const DB_ID = "684f9da6001c19c3c9a0";
const PROFILE_COLLECTION_ID = "684fa618002722712650";

export default function Landing() {
    const router = useRouter();

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const session = await account.get();
                const profile = await databases.getDocument(DB_ID, PROFILE_COLLECTION_ID, session.$id);
                if (profile?.role === "admin") {
                    router.replace("/admin");
                } else {
                    router.replace("/");
                }
            } catch {
                // Stay on landing page if not logged in
            }
        };

        checkLogin();
    }, []);

    return (
        <ImageBackground
            source={icons.landing}
            resizeMode="cover"
            className="flex-1"
        >
            <View className="flex-1 justify-center items-start ml-4 px-6 mt-48">
                <Text className="text-white text-2xl font-semibold mb-3">Miu Home</Text>
                <TouchableOpacity onPress={() => router.replace("/login")}>
                    <View className="border-b border-white pb-[1px]">
                        <Text className="text-white font-medium text-base">Get Started</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );

}
