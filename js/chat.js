var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './user', './lobby', './entrance', './room', './server', './videocenter'], function (require, exports, user_1, lobby_1, entrance_1, room_1, server_1, videocenter_1) {
    "use strict";
    var Chat = (function (_super) {
        __extends(Chat, _super);
        function Chat(url) {
            _super.call(this);
            _super.prototype.setSocketUrl.call(this, 'http://localhost:9001/');
            this._user = new user_1.User();
            this._entrance = new entrance_1.Entrance();
            this._room = new room_1.Room();
            this._server = new server_1.Server();
            this._lobby = new lobby_1.Lobby();
            console.log("chat constructor()");
        }
        Chat.prototype.start = function () {
            console.log('Chat::start() Begins ...');
            this._server.listen();
            this._server.ping(function (re) { return console.log(re); });
            var checkUser = this._user.hasUsername();
            if (checkUser === true) {
                var username = user_1.User.getUsername;
                server_1.Server.updateUsername(username, function (re) {
                    console.log("User change it's name to " + re);
                });
                lobby_1.Lobby.show();
            }
            else {
                entrance_1.Entrance.show();
            }
        };
        return Chat;
    }(videocenter_1.VideoCenter));
    exports.Chat = Chat;
});
//# sourceMappingURL=chat.js.map