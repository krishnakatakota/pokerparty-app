import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class PpWsService {
	private socket: WebSocket | null = null;
	private lastMessageSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
	public lastMessage = this.lastMessageSubject.asObservable();
	constructor() { }

	public connect(url: string): void {
		this.socket = new WebSocket(url);

		this.socket.onopen = (event) => {
			console.log("Websocket Connection Established: ", event);
		}
		this.socket.onmessage = (event) => {
			this.lastMessageSubject.next(event.data);
			console.log('WebSocket Message Received:', event.data);
		};

		this.socket.onerror = (event) => {
			console.error('WebSocket Error:', event);
		};

		this.socket.onclose = (event) => {
			console.log('WebSocket Connection Closed:', event);
		};
	}

	public sendMessage(message: any): void {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(message));
		} else {
			console.error('WebSocket is not open. Ready state:', this.socket?.readyState);
		}
	}

	public close(): void {
		if (this.socket) {
			this.socket.close();
		}
	}
}
