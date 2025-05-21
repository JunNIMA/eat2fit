import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import { store } from './store'
import App from './App'
import './index.css'

// 定义主题色（绿色）
const themeConfig = {
  token: {
    colorPrimary: '#52c41a',
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={themeConfig}>
        <App />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
) 