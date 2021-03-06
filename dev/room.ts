import { VideoCenter as vc } from './videocenter';
import { Element as e } from './element';
import { Server as server } from './server';
import { User as user } from './user';
import { Lobby } from './lobby';
import { Whiteboard } from './whiteboard';
import * as de from './declare';
export class Room extends vc {    
    static doneInit: boolean = false;
    private whiteboard: Whiteboard;
    constructor() {
        super();
        console.log("Room::constructor() ..");              
        this.whiteboard = new Whiteboard();
        this.initHandlers();
    }
    show() : void {
        let roomname : any = user.getRoomname;
        server.joinRoom( roomname, ()=>{
            console.log("Room::show() ....");   
            e.entrance.hide();      
            e.lobby.hide();
            e.room.show();
            let roomname : any = user.getRoomname;
            e.roomDisplayRoomname( roomname );
            server.userList( roomname, Room.show_user_list );
            let data :any = { room_name : roomname };
            data.command = "history";
            server.whiteboard( data, Room.whiteboard_get_draw_line_history );
        });
    }
    private initHandlers() : void {
        if ( Room.doneInit ) return;
        Room.doneInit = true;
        e.room_send_message.submit( this.send_message ); 
        e.room_onclick_leave.click( this.on_leave );        
        e.room_whiteboard_button.click( () => this.on_click_whiteboard() );      
        e.users_overlap.on('click','.user', (user) => this.on_click_user(user) );
        e.room.find('button[layout]').click( ( t ) => this.on_click_user_layout( t ) );
        $(".tab-opener").click(()=> {
            let bgmode = $(".background-effect").attr('mode');
            let ulmode = $(".user-list-slide").attr('mode');
            if(bgmode == "show")$(".background-effect").attr('mode',"hide");
            else $(".background-effect").attr('mode',"show");
            if(ulmode == "show")$(".user-list-slide").attr('mode',"hide");
            else $(".user-list-slide").attr('mode',"show");
            
        });
        e.room.on('submit', '.private-chat', this.send_private_message );
        e.room_private_chat_container.on('click', '.chat-close', ( event ) => this.private_chat_close( event ) );
        e.room_private_chat_container.on('click', '.private-chat-header', ( event ) => this.private_chat_slide( event )); 
       
    }
    private send_private_message( event ) :void {
        event.preventDefault();
        console.log($(this).find('[name="private-message"]'));
        let data = { message: $(this).find('[name="private-message"]').val(), pmsocket : $(this).attr('pmsocket'), name : user.getUsername }
        server.chat_private_message( data , (re)=> {          
            $(this).find('[name="private-message"]').val("");     
         } );
    }        
    private private_chat_slide( event ){
        let chat = event.currentTarget.nextElementSibling.parentElement;            
        let socket = $(chat).attr('pmsocket')
        e.room.private_chat( socket ).find(".chat").slideToggle(300, 'swing');
    }
    private private_chat_close( event ){
        event.preventDefault();           
        let chatdivider = $(event.target).parent().parent().parent();
        chatdivider.fadeOut(300,() => {
            chatdivider.remove();
        })
    }    
    static addMessage( data: de.ChatMessage ) {
        e.room_show_message( data );
    }
    static add_private_message( data ) {    
        if ( e.room.private_chat( data.pmsocket ).length == 0 ) e.room_append_private_chat(data);
        e.room_add_private_chat( data );
    }
    static addMessageJoin( u: de.User ) {
        let roomname : any = user.getRoomname;
        this.addMessage( { name: u.name, message: ' joins into room: ' + u.room });
    }
    static addMessageDisconnect( user: de.User ) {
        this.addMessage( { name: user.name, message: ' disconnect into ' + user.room });
    }
    static add_private_message_disconnect( user: de.User ) {
        let data = {name:user.name, pmsocket:user.socket,  message: ' disconnect into ' + user.room}
        e.room_add_private_chat( data );
    }
    private send_message( event ) :void {
        event.preventDefault();       
        server.chat_message( e.room_message.val(), (re)=> { 
            console.log("server.sendMessage => message => re: ", re);              
            e.room_message.val("");       
         } );
    }
    private on_leave( event ) :void {
        event.preventDefault();
        console.log("on_leave()");
        let oldroom :string= user.getRoomname;  
        server.broadcastLeave( oldroom, ()=>{
                console.log("Broadcast that you left the Lobby");
            } );
        server.leaveRoom( () => {          
            e.room_display.empty();
            user.save_roomname( "Lobby" );    
            //this.whiteboard.clear_canvas();//error
            e.room.hide();  
            new Lobby().show();
        });    
    }

    private on_click_whiteboard() {
        console.log('on_click_whiteboard()');
        let command;
        if ( this.whiteboard.isOpen() ) {
            this.whiteboard.hide();
            command = 'hide-whiteboard';
        }
        else {
            this.whiteboard.show();
            command = 'show-whiteboard';
        }
        server.whiteboard( { 'command': command }, x => {
            console.log('server.whiteboar() -> callback()');
         } );
    }
    private on_click_user_layout(event) {
        console.log(e.obj(event).attr('layout'));
        e.users.attr('layout', e.obj(event).attr('layout'));
        //e.users.attr('layout', style.currentTarget.innerHTML);
        //e.users.removeClass('list').removeClass('overlap').addClass('tile');
    }

    private on_click_user( user ) {       
        let users = user.delegateTarget;
        console.log(user);
        console.log(users);
        if( $(users).attr("layout") != "overlap" )return;
        e.user.removeClass('main');
        user.currentTarget.remove();
        e.users.append("<div class='user main'>"+ user.currentTarget.innerHTML +"</div>");
    
    }
    
    


    /**
     * -------------------------------------------------------
     * 
     * Events from Server
     * 
     * -------------------------------------------------------
     */

    

    static whiteboard_get_draw_line_history(  ) :void {        
         // Callback whiteboard_get_draw_line_history
         console.log("Get whiteboard draw line history");
    } 
    static show_user_list( users: Array<de.User> ) :void {        
        for( let i in users ) {
            if ( ! users.hasOwnProperty(i) ) continue;
            let user: de.User = users[i]; 
            if(user.type != de.admin_type){
                console.log( "show_user_list() "+user.name );                          
                Room.add_user(user);
            }
        }         
    } 
    static add_user( user : de.User ) : void {        
        e.room_remove_user( user );
        e.room_user_append( user ); // append the user into the room.
    }
    static remove_room_list( user : de.User ) :void {
         e.room_remove_user( user );
    } 
    static on_event_join_room( user: de.User ) {
        if( user.room != de.lobbyRoomName )Room.add_user( user );
        Room.addMessageJoin( user );
    }
    static on_event_disconnect_room( user: de.User ) {      
        Room.addMessageDisconnect( user );
    }
}
