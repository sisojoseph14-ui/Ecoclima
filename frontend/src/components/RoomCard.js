import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const evaluateComfort = (temp, hum, co2, emergency) => {
  if (emergency) return { status: '¡EMERGENCIA ACTIVADA!', color: '#D32F2F' };
  if (temp >= 20 && temp <= 25 && hum >= 40 && hum <= 60 && co2 < 800) {
    return { status: 'Optimizado', color: '#4CAF50' };
  }
  if (temp >= 18 && temp <= 27 && hum >= 30 && hum <= 70 && co2 < 1200) {
    return { status: 'Aceptable', color: '#FFC107' };
  }
  return { status: 'Crítico', color: '#F44336' };
};

export default function RoomCard({ roomName, metrics, onPress }) {
  const { status, color } = evaluateComfort(
    metrics.temperature,
    metrics.humidity,
    metrics.co2,
    metrics.emergency
  );

  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{roomName}</Text>
        <View style={[styles.indicator, { backgroundColor: color }]} />
      </View>
      
      <Text style={[styles.statusText, { color }]}>Estado: {status}</Text>
      
      <View style={styles.metricsContainer}>
        <Text style={styles.metric}>Temp: {metrics.temperature}°C</Text>
        <Text style={styles.metric}>Hum: {metrics.humidity}%</Text>
        <Text style={styles.metric}>CO2: {metrics.co2} ppm</Text>
      </View>
      <Text style={styles.time}>Última lectura: {metrics.last_updated}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 20, marginVertical: 10, borderRadius: 12, borderLeftWidth: 6, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  indicator: { width: 15, height: 15, borderRadius: 7.5 },
  statusText: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  metricsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  metric: { fontSize: 14, color: '#555', fontWeight: '500' },
  time: { fontSize: 12, color: '#999', textAlign: 'right' },
});