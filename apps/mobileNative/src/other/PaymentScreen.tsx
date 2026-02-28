import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { BACKEND_URL, RAZORPAY_KEY_ID } from '../constants/constant';
import { createOrderSchema } from '@aerovideo/schemas';
import { Colors } from '../constants/theme';
import useColorTheme from '../hooks/useColorTheme';

const PREDEFINED_AMOUNTS = [50, 100, 200];

export default function PaymentScreen() {
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const theme = useColorTheme();
  const currentColors = Colors[theme];

  const handlePayment = async () => {
    const amountToCharge =
      selectedAmount === 'custom' ? Number(customAmount) : selectedAmount;

    const result = createOrderSchema.safeParse({
      donorName,
      amount: amountToCharge,
    });
    if (!result.success) {
      Alert.alert(result.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on the backend
      const res = await fetch(`${BACKEND_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amountToCharge, donorName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      const orderData = data.data.order;

      // 2. Open Razorpay Checkout
      const options = {
        description: 'Support our platform',
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: orderData.currency,
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        name: 'AeroVideo Support',
        order_id: orderData.id,
        theme: { color: currentColors.background },
      };

      try {
        const responseData = await RazorpayCheckout.open(options);

        // 3. Verify Payment
        const verifyRes = await fetch(
          `${BACKEND_URL}/payments/verify-payment`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: responseData.razorpay_order_id,
              razorpay_payment_id: responseData.razorpay_payment_id,
              razorpay_signature: responseData.razorpay_signature,
            }),
          },
        );

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok) {
          throw new Error(verifyData.message || 'Payment verification failed');
        }

        Alert.alert(
          'Success',
          'Payment successful! Thank you for your support.',
        );
      } catch (err: any) {
        Alert.alert(
          'Payment Failed',
          err.description ||
            err.message ||
            'Transaction was cancelled or failed.',
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <Text style={[styles.title, { color: currentColors.text }]}>
        Support Us
      </Text>
      <Text style={[styles.subtitle, { color: currentColors.text }]}>
        Select an amount to send via Razorpay
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.textInput,
            {
              color: currentColors.text,
              backgroundColor: currentColors.background,
              borderColor: currentColors.icon,
            },
          ]}
          placeholder="Your Name"
          placeholderTextColor={currentColors.icon}
          value={donorName}
          onChangeText={setDonorName}
        />
      </View>

      <View style={styles.amountGrid}>
        {PREDEFINED_AMOUNTS.map(amt => (
          <TouchableOpacity
            key={amt}
            style={[
              styles.amountButton,
              {
                backgroundColor: currentColors.background,
                borderColor: currentColors.icon,
              },
              selectedAmount === amt && {
                borderColor: currentColors.tint,
                backgroundColor: currentColors.tint,
              },
            ]}
            onPress={() => setSelectedAmount(amt)}
          >
            <Text
              style={[
                styles.amountText,
                { color: currentColors.text },
                selectedAmount === amt && { color: currentColors.background },
              ]}
            >
              ₹{amt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.customContainer}>
        <TouchableOpacity
          style={[
            styles.customButton,
            {
              backgroundColor: currentColors.background,
              borderColor: currentColors.icon,
            },
            selectedAmount === 'custom' && {
              borderColor: currentColors.tint,
              backgroundColor: currentColors.tint,
            },
          ]}
          onPress={() => setSelectedAmount('custom')}
        >
          <Text
            style={[
              styles.amountText,
              { color: currentColors.text },
              selectedAmount === 'custom' && {
                color: currentColors.background,
              },
            ]}
          >
            Custom
          </Text>
        </TouchableOpacity>
        {selectedAmount === 'custom' && (
          <TextInput
            style={[
              styles.customInput,
              {
                color: currentColors.text,
                backgroundColor: currentColors.background,
                borderColor: currentColors.icon,
              },
            ]}
            keyboardType="numeric"
            placeholder="Amount (₹)"
            placeholderTextColor={currentColors.icon}
            value={customAmount}
            onChangeText={setCustomAmount}
          />
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.payButton,
          { backgroundColor: currentColors.tint },
          loading && styles.disabledButton,
        ]}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={currentColors.background} />
        ) : (
          <Text
            style={[styles.payButtonText, { color: currentColors.background }]}
          >
            Pay{' '}
            {selectedAmount === 'custom'
              ? customAmount
                ? `₹${customAmount}`
                : ''
              : `₹${selectedAmount}`}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  amountGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '600',
  },
  customContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    marginHorizontal: 4,
  },
  customButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  customInput: {
    flex: 2,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
  },
  payButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
