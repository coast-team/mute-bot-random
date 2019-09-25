import * as $protobuf from "protobufjs";
/** Properties of a Connection. */
export interface IConnection {

    /** Connection url */
    url?: (string|null);
}

/** Represents a Connection. */
export class Connection implements IConnection {

    /**
     * Constructs a new Connection.
     * @param [properties] Properties to set
     */
    constructor(properties?: IConnection);

    /** Connection url. */
    public url: string;

    /**
     * Creates a new Connection instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Connection instance
     */
    public static create(properties?: IConnection): Connection;

    /**
     * Encodes the specified Connection message. Does not implicitly {@link Connection.verify|verify} messages.
     * @param message Connection message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IConnection, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Connection message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Connection
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Connection;
}

/** Properties of a ConnectionResponse. */
export interface IConnectionResponse {

    /** ConnectionResponse url */
    url?: (string|null);

    /** ConnectionResponse list */
    list?: (string[]|null);
}

/** Represents a ConnectionResponse. */
export class ConnectionResponse implements IConnectionResponse {

    /**
     * Constructs a new ConnectionResponse.
     * @param [properties] Properties to set
     */
    constructor(properties?: IConnectionResponse);

    /** ConnectionResponse url. */
    public url: string;

    /** ConnectionResponse list. */
    public list: string[];

    /**
     * Creates a new ConnectionResponse instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ConnectionResponse instance
     */
    public static create(properties?: IConnectionResponse): ConnectionResponse;

    /**
     * Encodes the specified ConnectionResponse message. Does not implicitly {@link ConnectionResponse.verify|verify} messages.
     * @param message ConnectionResponse message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IConnectionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ConnectionResponse message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ConnectionResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ConnectionResponse;
}

/** Properties of a NetworkMessage. */
export interface INetworkMessage {

    /** NetworkMessage type */
    type?: (number|null);

    /** NetworkMessage senderId */
    senderId?: (number|null);

    /** NetworkMessage connection */
    connection?: (IConnection|null);

    /** NetworkMessage connectionResponse */
    connectionResponse?: (IConnectionResponse|null);

    /** NetworkMessage mutecoreMessage */
    mutecoreMessage?: (Uint8Array|null);
}

/** Represents a NetworkMessage. */
export class NetworkMessage implements INetworkMessage {

    /**
     * Constructs a new NetworkMessage.
     * @param [properties] Properties to set
     */
    constructor(properties?: INetworkMessage);

    /** NetworkMessage type. */
    public type: number;

    /** NetworkMessage senderId. */
    public senderId: number;

    /** NetworkMessage connection. */
    public connection?: (IConnection|null);

    /** NetworkMessage connectionResponse. */
    public connectionResponse?: (IConnectionResponse|null);

    /** NetworkMessage mutecoreMessage. */
    public mutecoreMessage: Uint8Array;

    /** NetworkMessage content. */
    public content?: ("connection"|"connectionResponse"|"mutecoreMessage");

    /**
     * Creates a new NetworkMessage instance using the specified properties.
     * @param [properties] Properties to set
     * @returns NetworkMessage instance
     */
    public static create(properties?: INetworkMessage): NetworkMessage;

    /**
     * Encodes the specified NetworkMessage message. Does not implicitly {@link NetworkMessage.verify|verify} messages.
     * @param message NetworkMessage message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: INetworkMessage, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a NetworkMessage message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns NetworkMessage
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): NetworkMessage;
}

/** Properties of a Message. */
export interface IMessage {

    /** Message streamId */
    streamId?: (number|null);

    /** Message subtype */
    subtype?: (number|null);

    /** Message content */
    content?: (Uint8Array|null);
}

/** Represents a Message. */
export class Message implements IMessage {

    /**
     * Constructs a new Message.
     * @param [properties] Properties to set
     */
    constructor(properties?: IMessage);

    /** Message streamId. */
    public streamId: number;

    /** Message subtype. */
    public subtype: number;

    /** Message content. */
    public content: Uint8Array;

    /**
     * Creates a new Message instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Message instance
     */
    public static create(properties?: IMessage): Message;

    /**
     * Encodes the specified Message message. Does not implicitly {@link Message.verify|verify} messages.
     * @param message Message message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IMessage, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Message message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Message
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Message;
}
