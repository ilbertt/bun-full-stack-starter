import { useState } from 'react';
import { type LogEntry, useLiveEvents } from '../../lib/hooks/use-live-events';

// The server has the real limit; this only stops the input offering to break it.
const MAX_MESSAGE_LENGTH = 200;
const INPUT_CLASS_NAME =
  'min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-gray-500';
const BUTTON_CLASS_NAME =
  'rounded-md bg-gray-900 px-3 py-2 font-medium text-sm text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200';
const META_CLASS_NAME = 'text-gray-500 text-xs dark:text-gray-400';
const SENT_CLASS_NAME = 'text-blue-600 dark:text-blue-400';
const RECEIVED_CLASS_NAME = 'text-green-600 dark:text-green-400';

function describe(entry: LogEntry): string {
  if (entry.direction === 'sent') {
    return `echo · “${entry.text}”`;
  }

  const { message } = entry;
  switch (message.type) {
    case 'echo':
      // The socket count is the half of this line the client could not have produced: it is what
      // makes the reply the server's rather than the page repeating what was typed into it.
      return `echo · “${message.text}” · ${message.sockets} ${
        message.sockets === 1 ? 'socket' : 'sockets'
      } · ${message.at.toLocaleTimeString()}`;
    case 'file.uploaded':
      return `file.uploaded · ${message.file.name}`;
    case 'file.deleted':
      return `file.deleted · ${message.fileId}`;
    case 'pong':
      return 'pong';
  }
}

/**
 * The socket, made visible. Say something and it comes back from the server — in this tab and in
 * every other one the same account has open, next to the file events taking the same path. Both
 * directions are listed, the way the frames pane in devtools lists them, because a reply you
 * cannot tell apart from your own input is not a reply anyone can see.
 */
export function LiveEvents() {
  const { connected, log, send } = useLiveEvents();
  const [text, setText] = useState('');

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <h4 className="font-medium text-sm">Socket</h4>
        <span
          className={META_CLASS_NAME}
          title={connected ? 'Subscribed to /api/events' : 'Reconnecting…'}
        >
          <span
            className={`mr-1.5 inline-block size-2 rounded-full align-middle ${
              connected ? 'bg-green-500' : 'bg-gray-400'
            }`}
            aria-hidden
          />
          {connected ? 'Live' : 'Offline'}
        </span>
      </div>

      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          send(text);
          setText('');
        }}
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Say something to the server"
          aria-label="Message the server"
          className={INPUT_CLASS_NAME}
        />
        <button
          type="submit"
          disabled={!connected || text.trim().length === 0}
          className={BUTTON_CLASS_NAME}
        >
          Send
        </button>
      </form>

      {log.length === 0 ? (
        <p className={META_CLASS_NAME}>
          Nothing yet. Send a message, or upload a file — both cross this socket.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {log.map((entry) => (
            <li key={entry.id} className={`flex gap-2 font-mono ${META_CLASS_NAME}`}>
              <span
                aria-hidden
                className={entry.direction === 'sent' ? SENT_CLASS_NAME : RECEIVED_CLASS_NAME}
              >
                {entry.direction === 'sent' ? '↑' : '↓'}
              </span>
              <span className="sr-only">
                {entry.direction === 'sent' ? 'sent to server' : 'received from server'}
              </span>
              <span className="truncate">{describe(entry)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
