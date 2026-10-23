import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, TextInput } from 'react-native';

const API_EMERGENCY_URL = 'http://192.168.5.164:8000/api/emergency';
const API_SENSORS_URL = 'http://192.168.5.164:8000/api/sensors';

export default function DetailScreen({ route, navigation }) {
  const { roomName, metrics } = route.params;
  const [isEmergency, setIsEmergency] = useState(metrics.emergency || false);
  
  // Estados para modo Edición
  const [isEditing, setIsEditing] = useState(false);
  const [temp, setTemp] = useState(String(metrics.temperature));
  const [hum, setHum] = useState(String(metrics.humidity));
  const [co2, setCo2] = useState(String(metrics.co2));

  const ventAnimation = useRef(new Animated.Value(metrics.emergency ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(ventAnimation, {
      toValue: isEmergency ? 1 : 0,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [isEmergency]);

  const toggleEmergency = async () => {
    const newState = !isEmergency;
    try {
      const response = await fetch(API_EMERGENCY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: roomName, active: newState }),
      });
      if (response.ok) setIsEmergency(newState);
    } catch (error) {
      Alert.alert('Error', 'No se pudo comunicar con el servidor');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(API_SENSORS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: roomName,
          temperature: parseFloat(temp) || 0,
          humidity: parseFloat(hum) || 0,
          co2: parseInt(co2) || 0
        }),
      });
      if (response.ok) {
        setIsEditing(false);
        Alert.alert('Éxito', 'Parámetros del salón actualizados');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los cambios');
    }
  };

  const handleDeleteRoom = () => {
    Alert.alert(
      'Eliminar Salón',
      `¿Estás seguro de eliminar el ${roomName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_SENSORS_URL}/${roomName}`, { method: 'DELETE' });
              if (response.ok) {
                navigation.goBack();
              }
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el salón');
            }
          } 
        }
      ]
    );
  };

  const ventWidth = ventAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['100%', '30%'],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.card, isEmergency && styles.emergencyCard]}>
        <Text style={styles.roomTitle}>{roomName}</Text>

        {/* Sistema de Ventilación Animado */}
        <View style={styles.ventContainer}>
          <Text style={styles.ventTitle}>Sistema de Ventilación Virtual</Text>
          <View style={styles.ventPipe}>
            <Animated.View style={[styles.ventFlap, { width: ventWidth }, isEmergency ? styles.flapOpen : styles.flapClosed]} />
          </View>
          <Text style={styles.ventStatusText}>{isEmergency ? '🌬️ Ventiladores al 100%' : '🔒 Compuertas cerradas'}</Text>
        </View>

        {/* Métricas o Inputs de Edición */}
        {isEditing ? (
          <View style={styles.editBox}>
            <Text style={styles.editLabel}>Editar Temperatura (°C):</Text>
            <TextInput style={styles.input} value={temp} onChangeText={setTemp} keyboardType="numeric" />
            
            <Text style={styles.editLabel}>Editar Humedad (%):</Text>
            <TextInput style={styles.input} value={hum} onChangeText={setHum} keyboardType="numeric" />
            
            <Text style={styles.editLabel}>Editar CO2 (ppm):</Text>
            <TextInput style={styles.input} value={co2} onChangeText={setCo2} keyboardType="numeric" />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
              <Text style={styles.btnText}>Guardar Cambios</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.dataBox}><Text style={styles.label}>Temperatura:</Text><Text style={styles.value}>{temp} °C</Text></View>
            <View style={styles.dataBox}><Text style={styles.label}>Humedad:</Text><Text style={styles.value}>{hum} %</Text></View>
            <View style={styles.dataBox}><Text style={styles.label}>CO2:</Text><Text style={styles.value}>{co2} ppm</Text></View>
          </View>
        )}

        {/* Botones de Control */}
        <TouchableOpacity 
          style={[styles.emergencyButton, isEmergency ? styles.btnActive : styles.btnInactive]} 
          onPress={toggleEmergency}
        >
          <Text style={styles.buttonText}>{isEmergency ? 'APAGAR EMERGENCIA' : 'ACTIVAR EMERGENCIA'}</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editToggleBtn} onPress={() => setIsEditing(!isEditing)}>
            <Text style={styles.secondaryBtnText}>{isEditing ? 'Cancelar Edición' : '✏️ Editar Salón'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteRoom}>
            <Text style={styles.secondaryBtnText}>🗑️ Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 20, justifyContent: 'center' },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, elevation: 4 },
  emergencyCard: { borderColor: '#D32F2F', borderWidth: 2 },
  roomTitle: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10, textAlign: 'center' },
  ventContainer: { backgroundColor: '#EAEDED', padding: 10, borderRadius: 10, marginBottom: 15, alignItems: 'center' },
  ventTitle: { fontSize: 11, fontWeight: 'bold', color: '#566573', marginBottom: 5 },
  ventPipe: { width: '100%', height: 16, backgroundColor: '#BDC3C7', borderRadius: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  ventFlap: { height: '100%', borderRadius: 8 },
  flapClosed: { backgroundColor: '#7F8C8D' },
  flapOpen: { backgroundColor: '#27AE60' },
  ventStatusText: { fontSize: 10, color: '#566573', marginTop: 4, fontStyle: 'italic' },
  dataBox: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ECF0F1' },
  label: { fontSize: 15, color: '#34495E' },
  value: { fontSize: 15, fontWeight: 'bold', color: '#2C3E50' },
  emergencyButton: { marginTop: 15, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnInactive: { backgroundColor: '#E74C3C' },
  btnActive: { backgroundColor: '#7F8C8D' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  editToggleBtn: { flex: 1, backgroundColor: '#3498DB', padding: 10, borderRadius: 8, alignItems: 'center', marginRight: 5 },
  deleteBtn: { flex: 1, backgroundColor: '#C0392B', padding: 10, borderRadius: 8, alignItems: 'center', marginLeft: 5 },
  secondaryBtnText: { color: '#FFF', fontWeight: '600', fontSize: 12 },
  editBox: { marginVertical: 5 },
  editLabel: { fontSize: 12, color: '#7F8C8D', marginBottom: 3 },
  input: { borderWidth: 1, borderColor: '#BDC3C7', borderRadius: 6, padding: 8, fontSize: 14, marginBottom: 8, color: '#333' },
  saveButton: { backgroundColor: '#27AE60', padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 5 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 }
});