"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = exports.Message = exports.NetworkMessage = exports.ConnectionResponse = exports.Connection = undefined;

var _minimal = require("protobufjs/minimal");

var $protobuf = _interopRequireWildcard(_minimal);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// Common aliases
var $Reader = $protobuf.Reader,
    $Writer = $protobuf.Writer,
    $util = $protobuf.util;

// Exported root namespace
/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

var Connection = exports.Connection = $root.Connection = function () {

    /**
     * Properties of a Connection.
     * @exports IConnection
     * @interface IConnection
     * @property {string|null} [url] Connection url
     */

    /**
     * Constructs a new Connection.
     * @exports Connection
     * @classdesc Represents a Connection.
     * @implements IConnection
     * @constructor
     * @param {IConnection=} [properties] Properties to set
     */
    function Connection(properties) {
        if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
            if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
        }
    }

    /**
     * Connection url.
     * @member {string} url
     * @memberof Connection
     * @instance
     */
    Connection.prototype.url = "";

    /**
     * Creates a new Connection instance using the specified properties.
     * @function create
     * @memberof Connection
     * @static
     * @param {IConnection=} [properties] Properties to set
     * @returns {Connection} Connection instance
     */
    Connection.create = function create(properties) {
        return new Connection(properties);
    };

    /**
     * Encodes the specified Connection message. Does not implicitly {@link Connection.verify|verify} messages.
     * @function encode
     * @memberof Connection
     * @static
     * @param {IConnection} message Connection message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Connection.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        if (message.url != null && message.hasOwnProperty("url")) writer.uint32( /* id 1, wireType 2 =*/10).string(message.url);
        return writer;
    };

    /**
     * Decodes a Connection message from the specified reader or buffer.
     * @function decode
     * @memberof Connection
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Connection} Connection
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Connection.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length,
            message = new $root.Connection();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.url = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };

    return Connection;
}();

var ConnectionResponse = exports.ConnectionResponse = $root.ConnectionResponse = function () {

    /**
     * Properties of a ConnectionResponse.
     * @exports IConnectionResponse
     * @interface IConnectionResponse
     * @property {string|null} [url] ConnectionResponse url
     * @property {Array.<string>|null} [list] ConnectionResponse list
     */

    /**
     * Constructs a new ConnectionResponse.
     * @exports ConnectionResponse
     * @classdesc Represents a ConnectionResponse.
     * @implements IConnectionResponse
     * @constructor
     * @param {IConnectionResponse=} [properties] Properties to set
     */
    function ConnectionResponse(properties) {
        this.list = [];
        if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
            if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
        }
    }

    /**
     * ConnectionResponse url.
     * @member {string} url
     * @memberof ConnectionResponse
     * @instance
     */
    ConnectionResponse.prototype.url = "";

    /**
     * ConnectionResponse list.
     * @member {Array.<string>} list
     * @memberof ConnectionResponse
     * @instance
     */
    ConnectionResponse.prototype.list = $util.emptyArray;

    /**
     * Creates a new ConnectionResponse instance using the specified properties.
     * @function create
     * @memberof ConnectionResponse
     * @static
     * @param {IConnectionResponse=} [properties] Properties to set
     * @returns {ConnectionResponse} ConnectionResponse instance
     */
    ConnectionResponse.create = function create(properties) {
        return new ConnectionResponse(properties);
    };

    /**
     * Encodes the specified ConnectionResponse message. Does not implicitly {@link ConnectionResponse.verify|verify} messages.
     * @function encode
     * @memberof ConnectionResponse
     * @static
     * @param {IConnectionResponse} message ConnectionResponse message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ConnectionResponse.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        if (message.url != null && message.hasOwnProperty("url")) writer.uint32( /* id 1, wireType 2 =*/10).string(message.url);
        if (message.list != null && message.list.length) for (var i = 0; i < message.list.length; ++i) {
            writer.uint32( /* id 2, wireType 2 =*/18).string(message.list[i]);
        }return writer;
    };

    /**
     * Decodes a ConnectionResponse message from the specified reader or buffer.
     * @function decode
     * @memberof ConnectionResponse
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ConnectionResponse} ConnectionResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ConnectionResponse.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length,
            message = new $root.ConnectionResponse();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.url = reader.string();
                    break;
                case 2:
                    if (!(message.list && message.list.length)) message.list = [];
                    message.list.push(reader.string());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };

    return ConnectionResponse;
}();

var NetworkMessage = exports.NetworkMessage = $root.NetworkMessage = function () {

    /**
     * Properties of a NetworkMessage.
     * @exports INetworkMessage
     * @interface INetworkMessage
     * @property {number|null} [type] NetworkMessage type
     * @property {number|null} [senderId] NetworkMessage senderId
     * @property {IConnection|null} [connection] NetworkMessage connection
     * @property {IConnectionResponse|null} [connectionResponse] NetworkMessage connectionResponse
     * @property {Uint8Array|null} [mutecoreMessage] NetworkMessage mutecoreMessage
     */

    /**
     * Constructs a new NetworkMessage.
     * @exports NetworkMessage
     * @classdesc Represents a NetworkMessage.
     * @implements INetworkMessage
     * @constructor
     * @param {INetworkMessage=} [properties] Properties to set
     */
    function NetworkMessage(properties) {
        if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
            if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
        }
    }

    /**
     * NetworkMessage type.
     * @member {number} type
     * @memberof NetworkMessage
     * @instance
     */
    NetworkMessage.prototype.type = 0;

    /**
     * NetworkMessage senderId.
     * @member {number} senderId
     * @memberof NetworkMessage
     * @instance
     */
    NetworkMessage.prototype.senderId = 0;

    /**
     * NetworkMessage connection.
     * @member {IConnection|null|undefined} connection
     * @memberof NetworkMessage
     * @instance
     */
    NetworkMessage.prototype.connection = null;

    /**
     * NetworkMessage connectionResponse.
     * @member {IConnectionResponse|null|undefined} connectionResponse
     * @memberof NetworkMessage
     * @instance
     */
    NetworkMessage.prototype.connectionResponse = null;

    /**
     * NetworkMessage mutecoreMessage.
     * @member {Uint8Array} mutecoreMessage
     * @memberof NetworkMessage
     * @instance
     */
    NetworkMessage.prototype.mutecoreMessage = $util.newBuffer([]);

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields = void 0;

    /**
     * NetworkMessage content.
     * @member {"connection"|"connectionResponse"|"mutecoreMessage"|undefined} content
     * @memberof NetworkMessage
     * @instance
     */
    Object.defineProperty(NetworkMessage.prototype, "content", {
        get: $util.oneOfGetter($oneOfFields = ["connection", "connectionResponse", "mutecoreMessage"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new NetworkMessage instance using the specified properties.
     * @function create
     * @memberof NetworkMessage
     * @static
     * @param {INetworkMessage=} [properties] Properties to set
     * @returns {NetworkMessage} NetworkMessage instance
     */
    NetworkMessage.create = function create(properties) {
        return new NetworkMessage(properties);
    };

    /**
     * Encodes the specified NetworkMessage message. Does not implicitly {@link NetworkMessage.verify|verify} messages.
     * @function encode
     * @memberof NetworkMessage
     * @static
     * @param {INetworkMessage} message NetworkMessage message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    NetworkMessage.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        if (message.type != null && message.hasOwnProperty("type")) writer.uint32( /* id 1, wireType 0 =*/8).uint32(message.type);
        if (message.senderId != null && message.hasOwnProperty("senderId")) writer.uint32( /* id 2, wireType 0 =*/16).uint32(message.senderId);
        if (message.connection != null && message.hasOwnProperty("connection")) $root.Connection.encode(message.connection, writer.uint32( /* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.connectionResponse != null && message.hasOwnProperty("connectionResponse")) $root.ConnectionResponse.encode(message.connectionResponse, writer.uint32( /* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.mutecoreMessage != null && message.hasOwnProperty("mutecoreMessage")) writer.uint32( /* id 5, wireType 2 =*/42).bytes(message.mutecoreMessage);
        return writer;
    };

    /**
     * Decodes a NetworkMessage message from the specified reader or buffer.
     * @function decode
     * @memberof NetworkMessage
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {NetworkMessage} NetworkMessage
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    NetworkMessage.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length,
            message = new $root.NetworkMessage();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.type = reader.uint32();
                    break;
                case 2:
                    message.senderId = reader.uint32();
                    break;
                case 3:
                    message.connection = $root.Connection.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.connectionResponse = $root.ConnectionResponse.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.mutecoreMessage = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };

    return NetworkMessage;
}();

var Message = exports.Message = $root.Message = function () {

    /**
     * Properties of a Message.
     * @exports IMessage
     * @interface IMessage
     * @property {number|null} [streamId] Message streamId
     * @property {number|null} [subtype] Message subtype
     * @property {Uint8Array|null} [content] Message content
     */

    /**
     * Constructs a new Message.
     * @exports Message
     * @classdesc Represents a Message.
     * @implements IMessage
     * @constructor
     * @param {IMessage=} [properties] Properties to set
     */
    function Message(properties) {
        if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
            if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
        }
    }

    /**
     * Message streamId.
     * @member {number} streamId
     * @memberof Message
     * @instance
     */
    Message.prototype.streamId = 0;

    /**
     * Message subtype.
     * @member {number} subtype
     * @memberof Message
     * @instance
     */
    Message.prototype.subtype = 0;

    /**
     * Message content.
     * @member {Uint8Array} content
     * @memberof Message
     * @instance
     */
    Message.prototype.content = $util.newBuffer([]);

    /**
     * Creates a new Message instance using the specified properties.
     * @function create
     * @memberof Message
     * @static
     * @param {IMessage=} [properties] Properties to set
     * @returns {Message} Message instance
     */
    Message.create = function create(properties) {
        return new Message(properties);
    };

    /**
     * Encodes the specified Message message. Does not implicitly {@link Message.verify|verify} messages.
     * @function encode
     * @memberof Message
     * @static
     * @param {IMessage} message Message message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Message.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        if (message.streamId != null && message.hasOwnProperty("streamId")) writer.uint32( /* id 1, wireType 0 =*/8).uint32(message.streamId);
        if (message.subtype != null && message.hasOwnProperty("subtype")) writer.uint32( /* id 2, wireType 0 =*/16).uint32(message.subtype);
        if (message.content != null && message.hasOwnProperty("content")) writer.uint32( /* id 3, wireType 2 =*/26).bytes(message.content);
        return writer;
    };

    /**
     * Decodes a Message message from the specified reader or buffer.
     * @function decode
     * @memberof Message
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Message} Message
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Message.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length,
            message = new $root.Message();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.streamId = reader.uint32();
                    break;
                case 2:
                    message.subtype = reader.uint32();
                    break;
                case 3:
                    message.content = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };

    return Message;
}();

exports.default = $root;
