import { useState } from 'react';
import { cn } from '../../lib/class-names';
import { type LogEntry, useLiveEvents } from '../../lib/hooks/use-live-events';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';

// The server has the real limit; this only stops the input offering to break it.
const MAX_MESSAGE_LENGTH = 200;

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
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">Socket</h4>
          <span
            className="text-muted-foreground text-xs"
            title={connected ? 'Subscribed to /api/events' : 'Reconnecting…'}
          >
            <span
              className={cn(
                'mr-1.5 inline-block size-2 rounded-full align-middle',
                connected ? 'bg-green-500' : 'bg-muted-foreground',
              )}
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
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Say something to the server"
            aria-label="Message the server"
          />
          <Button type="submit" disabled={!connected || text.trim().length === 0}>
            Send
          </Button>
        </form>

        {log.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            Nothing yet. Send a message, or upload a file — both cross this socket.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {log.map((entry) => (
              <li key={entry.id} className="flex gap-2 font-mono text-muted-foreground text-xs">
                <span
                  aria-hidden
                  className={entry.direction === 'sent' ? 'text-blue-600' : 'text-green-600'}
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
      </CardContent>
    </Card>
  );
}
