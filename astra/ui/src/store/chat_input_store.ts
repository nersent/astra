import { action, computed, makeObservable, observable } from "mobx";
import { createRef } from "react";
import { ChatEvent as ApiChatEvent } from "~/astra/common/chat";
import { removeFromArray } from "~/common/js/array";
import { clearInput, hasWindow, openFileSelectPopup } from "~/common/js/dom";
import { randomString } from "~/common/js/random";

import { UploadMediaProgressEvent } from "./api_client";
import { AppStore } from "./app_store";

export interface Attachment {
  uuid: string;
  file: File;
  uploadPct: number;
  isUploaded: boolean;
  mediaUuid?: string;
}

export class ChatInputStore {
  public inputRef = createRef<HTMLInputElement>();
  public bottomBarRef = createRef<HTMLDivElement>();
  public text: string = "";
  public isSending = false;
  public isFileDraggedOver = false;
  public attachments: Attachment[] = [];
  public attachFilePopupRef = createRef<HTMLDivElement>();

  constructor(private readonly store: AppStore) {
    makeObservable(this, {
      text: observable,
      isFileDraggedOver: observable,
      isAttachFilePopupVisible: computed,
      clear: action,
      isEmpty: computed,
      attachments: observable,
      isSending: observable,
      onDragEnter: action,
      onDragLeave: action,
      onDrop: action,
      openFileSelectPopup: action,
      send: action,
      addFiles: action,
      removeFile: action,
      upload: action,
      areAllAttachmentsUploaded: computed,
    });

    if (hasWindow) {
      window.addEventListener("dragenter", this.onDragEnter);
      window.addEventListener("dragleave", this.onDragLeave);
      window.addEventListener("dragover", this.onDragOver);
      window.addEventListener("drop", this.onDrop);
    }

    this.store.api.on(
      "uploadMediaProgress",
      this.onUploadMediaProgress.bind(this),
    );
  }

  public get areAllAttachmentsUploaded(): boolean {
    return this.attachments.every((a) => a.isUploaded);
  }

  private onUploadMediaProgress(e: UploadMediaProgressEvent): void {
    const attachment = this.attachments.find((a) => a.file === e.req.file);
    if (attachment == null) return;
    attachment.uploadPct = e.pct;
  }

  public get isAttachFilePopupVisible(): boolean {
    return this.isFileDraggedOver;
  }

  public clear(): void {
    clearInput(this.inputRef?.current);
    this.attachments = [];
  }

  public get isEmpty(): boolean {
    return this.text.length === 0 && this.attachments.length === 0;
  }

  public onDragEnter = (e: DragEvent): void => {
    if (!e.dataTransfer?.types.includes("Files")) return;
    if (this.isFileDraggedOver) return;
    // if (!e.dataTransfer?.files.length) return;
    e.preventDefault();
    e.stopPropagation();
    this.isFileDraggedOver = true;
    // console.log("drag enter", e);
  };

  public onDragOver = (e: DragEvent): void => {
    if (e.target !== this.attachFilePopupRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    // console.log("drag over", e);
  };

  public onDragLeave = (e: DragEvent): void => {
    if (e.target !== this.attachFilePopupRef.current) return;
    // if (e.target === this.attachFilePopupRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    this.isFileDraggedOver = false;
    // console.log(e.target === this.attachFilePopupRef.current);
    // console.log("drag leave", e);
  };

  public addFiles(files: File[]): void {
    const attachments: Attachment[] = files.map((file) => ({
      uuid: randomString(),
      file,
      uploadPct: 0,
      isUploaded: false,
    }));

    this.attachments.push(...attachments);

    for (const attachment of attachments) {
      this.upload(attachment);
    }
  }

  public async upload(attachment: Attachment): Promise<Attachment | undefined> {
    const res = await this.store.api.uploadMedia({
      file: attachment.file,
    });
    const att = this.attachments.find((a) => a.uuid === attachment.uuid);
    if (att == null) return;
    att.mediaUuid = res.media.uuid;
    att.isUploaded = true;
    return att;
  }

  public onDrop = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    this.isFileDraggedOver = false;
    const files = e.dataTransfer?.files;
    if (!files) return;
    this.addFiles([...files]);
  };

  public async openFileSelectPopup(): Promise<void> {
    const files = await openFileSelectPopup({ multiple: true });
    this.addFiles(files);
  }

  public removeFile(file: File): void {
    this.attachments = this.attachments.filter((a) => a.file !== file);
  }

  public async send(): Promise<void> {
    if (this.isSending) return;
    if (this.store.chat.isActive) return;
    const chatData = this.store.chat.data;
    if (chatData == null) return;
    const me = this.store.api.me;
    if (me == null) return;
    if (!this.areAllAttachmentsUploaded) return;

    this.isSending = true;
    this.store.chat.isActive = true;

    try {
      const res = await this.store.api.sendChatMessage({
        chatUuid: chatData.uuid,
        text: this.text,
        attachments: this.attachments
          .map((a) => a.mediaUuid)
          .filter((r) => r != null) as string[],
      });
      this.store.chat.addEvents(res.events);

      this.clear();
      this.store.chat.scrollToBottom();
    } catch (error) {
    } finally {
      this.isSending = false;
    }
  }
}
