import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Request, MsgTypes } from "../objects/request";

@Injectable({
	providedIn: 'root'
})
export class PpWsService {
	public socket: WebSocket | null = null;
	private lastMessageSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
	public lastMessage = this.lastMessageSubject.asObservable();
	constructor() { }

// In pp-ws.service.ts
public connect(url: string): void {
    if (this.socket) {
        console.log('Closing existing connection');
        this.socket.close();
    }

    console.log('Creating new WebSocket connection to:', url);
    
    try {
        this.socket = new WebSocket(url, []);
        
        this.socket.onopen = (event) => {
            console.log('WebSocket connected:', {
                readyState: this.socket?.readyState,
                url: this.socket?.url,
                protocol: this.socket?.protocol
            });
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', {
                readyState: this.socket?.readyState,
                url: this.socket?.url,
                error
            });
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket closed:', {
                readyState: this.socket?.readyState,
                clean: event.wasClean,
                code: event.code,
                reason: event.reason
            });
        };
    } catch (error) {
        console.error('Failed to create WebSocket:', error);
    }
}

	public sendMessage(requestType: MsgTypes, payload: any): void {
		const req: Request = {
			reqType: requestType,
			message: payload
		};

		console.log(req);

		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(req));
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
