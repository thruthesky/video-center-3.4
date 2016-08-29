import { VideoCenter as vc } from './videocenter';
import { Chat as chat } from './chat';
import { Lobby as lobby } from './lobby';
import { Room as room } from './room';
export class Server extends vc {

    private socket: any;
    constructor() {
        super();
        this.socket = super.getSocket();  
    }
    public listen( ) : void {        
        this.socket.on('get-message', ( data )=>{
           this.getMessage( data );
        });
    }
    private emit( protocol: string, data: any ) {
        this.socket.emit( protocol, data );
    }
    
    public ping(callback) : void {
        this.emit( 'ping', (re) => {
            // this;
            callback( re );
        });
    }
    private getMessage( data: any ) : void {        
        if ( data.room == "Lobby"){
            console.log("Go to Lobby chat.");
            lobby.showMessage( data );
        }
        else {
            console.log("Go to Room chat.");
            room.showMessage( data );
        }
    }
    static joinLobby( callback : any ) {
        let _this = new this;
        _this.socket.emit("join-lobby", callback );
    }
    static joinRoom( roomname:string, callback : any ) {
        let _this = new this;
        _this.socket.emit("join-room", roomname, callback );
    }
    static updateUsername( username: string, callback: any ) : void {
        let _this = new this;
        _this.socket.emit( 'update-username', username, callback );
    }
    static createRoom( roomname: string, callback: any ) : void {
        let _this = new this;
        _this.socket.emit( 'create-room', roomname, callback );
    }
    static sendMessage( message: string, callback: any ) : void {
        let _this = new this;
        _this.socket.emit( 'send-message', message, callback );
    }   
    static leaveRoom(callback : any ) : void {
        let _this = new this;
        _this.socket.emit('leave-room', callback );
    }
    static logout(callback : any ) : void {
        let _this = new this;
        _this.socket.emit('log-out', callback );
    }
   
}