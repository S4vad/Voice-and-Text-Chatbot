import React from 'react'
import Nav from './Nav'
import ChatBot from './ChatBot'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary flex flex-col md:flex-row ">
      <Nav/>
      <ChatBot/>

    </div>
  )
}
