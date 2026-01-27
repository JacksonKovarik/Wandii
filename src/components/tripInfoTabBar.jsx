import { useRouter, useSegments } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/colors";

export default function TripInfoTabBar({ tripId }) {
    const segments = useSegments();
    const router = useRouter();

    const activeSegment = segments[segments.length - 1] || 'overview';
    const isActive = (tabName) => activeSegment === tabName;
    
    return (
        <View style={{ height: '22%', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', paddingHorizontal: '5%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
        
            <TouchableOpacity 
                onPress={ () => router.navigate(`/(trip-info)/${tripId}/overview`)}
                style={{ 
                    height: '100%', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    paddingHorizontal: '2%', 
                    paddingTop: 3                    
                }}
            >
                <Text 
                    style={{ 
                        marginTop: 'auto', 
                        fontSize: 17, 
                        fontWeight: 'bold', 
                        color: isActive('overview') ? Colors.primary : Colors.textSecondary 
                    }}
                >
                    Overview
                </Text>

                <View 
                    style={{
                        height: 3,
                        width: '80%',
                        backgroundColor: isActive('overview') ? Colors.primary : 'transparent',
                        marginTop: 'auto',
                        borderRadius: 2,
                    }} 
                />
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={ () => router.navigate(`/(trip-info)/${tripId}/plan`)}
                style={{ 
                    height: '100%', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    paddingHorizontal: '2%', 
                    paddingTop: 3                    
                }}
            >
                <Text 
                    style={{ 
                        marginTop: 'auto', 
                        fontSize: 17, 
                        fontWeight: 'bold', 
                        color: isActive('plan') ? Colors.primary : Colors.textSecondary 
                    }}
                >
                    Plan
                </Text>

                <View 
                    style={{
                        height: 3,
                        width: '80%',
                        backgroundColor: isActive('plan') ? Colors.primary : 'transparent',
                        marginTop: 'auto',
                        borderRadius: 2,
                    }} 
                />
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={ () => router.navigate(`/(trip-info)/${tripId}/wallet`)}
                style={{ 
                    height: '100%', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    paddingHorizontal: '2%', 
                    paddingTop: 3                    
                }}
            >
                <Text 
                    style={{ 
                        marginTop: 'auto', 
                        fontSize: 17, 
                        fontWeight: 'bold', 
                        color: isActive('wallet') ? Colors.primary : Colors.textSecondary 
                    }}
                >
                    Wallet
                </Text>

                <View 
                    style={{
                        height: 3,
                        width: '80%',
                        backgroundColor: isActive('wallet') ? Colors.primary : 'transparent',
                        marginTop: 'auto',
                        borderRadius: 2,
                    }} 
                />
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={ () => router.navigate(`/(trip-info)/${tripId}/docs`)}
                style={{ 
                    height: '100%', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    paddingHorizontal: '2%', 
                    paddingTop: 3                    
                }}
            >
                <Text 
                    style={{ 
                        marginTop: 'auto', 
                        fontSize: 17, 
                        fontWeight: 'bold', 
                        color: isActive('docs') ? Colors.primary : Colors.textSecondary 
                    }}
                >
                    Docs
                </Text>

                <View 
                    style={{
                        height: 3,
                        width: '80%',
                        backgroundColor: isActive('docs') ? Colors.primary : 'transparent',
                        marginTop: 'auto',
                        borderRadius: 2,
                    }} 
                />
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={ () => router.navigate(`/(trip-info)/${tripId}/chat`)}
                style={{ 
                    height: '100%', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    paddingHorizontal: '2%', 
                    paddingTop: 3                    
                }}
            >
                <Text 
                    style={{ 
                        marginTop: 'auto', 
                        fontSize: 17, 
                        fontWeight: 'bold', 
                        color: isActive('chat') ? Colors.primary : Colors.textSecondary 
                    }}
                >
                    Chat
                </Text>

                <View 
                    style={{
                        height: 3,
                        width: '80%',
                        backgroundColor: isActive('chat') ? Colors.primary : 'transparent',
                        marginTop: 'auto',
                        borderRadius: 2,
                    }} 
                />
            </TouchableOpacity>
        </View>
    );
}
