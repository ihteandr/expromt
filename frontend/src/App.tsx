import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './App.module.css';
import { useCreateMessage, useMessages } from './api/messages/messages.api';
import LoadingWrapper from './shared/ui/helpers/LoadingWrapper/LoadingWrapper';
import { useWebSocketQuery } from './socket/socket';
function App() {
  const { isFetching, data: messages, isLoading } = useMessages();
  const messagesRef = useRef<HTMLDivElement>(null)
  const { mutateAsync: createMessage, isPending: isSendingMessage } = useCreateMessage();
  const [text, setText] = useState<string>('')
  const updateText = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setText(e.currentTarget.value)
  }, []);
  useWebSocketQuery(['messages'])
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, isFetching])
  const sendMessage = useCallback(() => {
    if (text) {
      createMessage({ text }).then((message) => {
        if (message) {
          setText('')
        } else {
          alert('Failed to send message');
        }
      })
    }
  }, [text, createMessage])
  
  return (
    <LoadingWrapper isLoading={isLoading}>
      <div className={styles.App}>
        <div className={styles.Messages} ref={messagesRef}>
          {messages?.map((message, index) => (
            <div className={styles.Message} key={index}>{message.text}</div>
          ))}
        </div>
        {isSendingMessage ? <div className={styles.SendingMessageLabel}>Sending Message ....</div> : null}
        <div className={styles.Input}>
          <input type="text" onInput={updateText} value={text}/>
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </LoadingWrapper>
  );
}

export default App;
