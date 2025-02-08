import { Entypo } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { Pressable } from 'react-native'

interface BackButtonProps{
  color?:string,
}


export default function BackButton({color}:BackButtonProps) {
  return (
    <Pressable onPress={()=>router.back()}>
            <Entypo name="chevron-thin-left" size={20} color={color?color:"black"} />
    </Pressable>
  )
}
