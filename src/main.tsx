import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Home from './routes/Home.tsx'
import UserDetails from './routes/UserDetails.tsx'
import ErrorPage from './routes/ErrorPage.tsx'
import 'tailwindcss/tailwind.css';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import {
  createBrowserRouter,
  RouterProvider,
  BrowserRouter
} from "react-router-dom"

import { ThemeProvider } from "@material-tailwind/react";


const queryClient = new QueryClient()

const router = createBrowserRouter([{
  path: "/",
  element: <App />,
  errorElement: <ErrorPage />,
  children: [
    {
      path: "/",
      element: <Home />
    },
    {
      path: "/userDetails",
      element: <UserDetails />
    }
  ]
}])







ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
