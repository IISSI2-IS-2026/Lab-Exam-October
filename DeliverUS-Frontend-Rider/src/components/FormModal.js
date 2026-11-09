import React, { useState, useRef } from 'react'
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  TextInput // Solution
  // KeyboardAvoidingView
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import TextSemiBold from './TextSemiBold'
import * as GlobalStyles from '../styles/GlobalStyles'
import TextRegular from './TextRegular'

export default function FormModal(props) {
  const inputRef = useRef(null)

  return (
    <Modal
      presentationStyle="overFullScreen"
      animationType="slide"
      transparent={true}
      visible={props.isVisible}
      onRequestClose={props.onCancel}      
      onShow={() => {inputRef.current?.focus()}}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TextSemiBold textStyle={{ fontSize: 15 }}>
            {`Please introduce the ${props.infoDescriptor}: `}
            <TextInput 
              ref={inputRef}
              value={props.inputValue}
              onChangeText={props.onChangeInputValue}
            />
          </TextSemiBold>
          <Pressable
            onPress={props.onCancel}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandBlueTap
                  : GlobalStyles.brandBlue
              },
              styles.actionButton
            ]}
          >
            <View
              style={[
                { flex: 1, flexDirection: 'row', justifyContent: 'center' }
              ]}
            >
              <MaterialCommunityIcons name="close" color={'white'} size={20} />
              <TextRegular textStyle={styles.text}>Cancel</TextRegular>
            </View>
          </Pressable>
          <Pressable
            onPress={props.onConfirm}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandPrimaryTap
                  : GlobalStyles.brandPrimary
              },
              styles.actionButton
            ]}
          >
            <View
              style={[
                { flex: 1, flexDirection: 'row', justifyContent: 'center' }
              ]}
            >
              <MaterialCommunityIcons name="package-variant-closed-check" color={'white'} size={20} />
              <TextRegular textStyle={styles.text}>Confirm {props.infoDescriptor}</TextRegular>
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.75,
    shadowRadius: 4,
    elevation: 5,
    width: '90%'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  }
})
