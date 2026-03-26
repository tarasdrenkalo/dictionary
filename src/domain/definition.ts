import { i18n } from "../i18n/labels.js";

export interface VersionedDefinition {
    VersionNumber:number;
    Creator:string;
    Content:i18n<string>;
    Sources:Array<string>|null;
    id:string;
}
export interface GenericDefinition {
    id:string;
    Versions:Array<VersionedDefinition>|null;
    Current:VersionedDefinition;
    IsLocked:boolean;
    IsApproved:boolean;
    IsVisible: boolean;
    IsDeleted: boolean;
    CreatedAt:number|null;
    LastModifiedAt:number|null;
    Contributors:Array<string>;
}
export interface DefinitionConstructiorOptions {
    versioning:number;
    content:i18n<string>;
    sources:Array<string>|null;
    creator:string;
    createdat:number|null;
    lastmodified:number|null;
}
export class Definition implements GenericDefinition {
    id: string;
    IsApproved: boolean;
    Versions: VersionedDefinition[];
    Current: VersionedDefinition;
    IsLocked: boolean;
    IsVisible: boolean;
    IsDeleted: boolean;
    CreatedAt: number|null;
    LastModifiedAt: number|null;
    Contributors: Array<string>;
    constructor(options:DefinitionConstructiorOptions) {
        this.IsApproved = false;
        this.id = crypto.randomUUID();
        const current:VersionedDefinition = {
            Content: options?.content,
            id:crypto.randomUUID(),
            Creator: options.creator,
            Sources: options.sources,
            VersionNumber: options.versioning,
        }
        this.Contributors = [];
        this.Contributors.push(options.creator);
        this.Current = current;
        this.Versions = [];
        this.Versions.push(current);
        this.CreatedAt = options.createdat;
        this.LastModifiedAt = options.lastmodified;
        this.IsLocked = false;
        this.IsVisible = false;
        this.IsDeleted = false;
    }
    Edit(content:string,by:string, sources:string[]) {
        const current:VersionedDefinition = {
            Content: {English:content},
            Creator: by,
            VersionNumber: Math.max(...this.Versions.map(v => v.VersionNumber), 0) + 1,
            Sources: sources,
            id: crypto.randomUUID(),
        }
        this.Versions.push(current);
        this.Current = current;
        this.Contributors.push(by);
        return this;
    }
    Delete(version:number|string) {
        let target:VersionedDefinition|undefined;
        if(typeof target === "undefined") throw "Version not found!";
        switch(typeof version) {
            case "string":
                target = this.Versions?.filter((vd)=>vd.id == version)[0];
                if(target === this.Current) throw "Can not remove current!";
                this.Versions = this.Versions.filter((vd)=>vd.id != version);
                break;
            case "number":
                target = this.Versions?.filter((vd)=>vd.VersionNumber == version)[0];
                this.Versions = this.Versions.filter((vd)=>vd.VersionNumber != version);
                break;
            default:
                throw "Unable to perform Operation!";
        }
        return this;
    }
    Lock = ()=>{
        this.IsLocked = true;
        return this;
    }
    Unlock = ()=>{
        this.IsLocked = false;
        return this;
    }
    Show = ()=>{
        this.IsVisible = true;
        return this;
    }
    Hide = ()=>{
        this.IsVisible = false;
        return this;
    }
    ToJSON(): GenericDefinition {
        return {
            id: this.id,
            Versions: this.Versions,
            Current: this.Current,
            IsLocked: this.IsLocked,
            IsApproved: this.IsApproved,
            IsVisible: this.IsVisible,
            IsDeleted: this.IsDeleted,
            CreatedAt: this.CreatedAt,
            LastModifiedAt: this.LastModifiedAt,
            Contributors: this.Contributors
        }
    }
    static FromJSON(def: GenericDefinition): Definition {
        const d = Object.create(Definition.prototype) as Definition;
        d.id = def.id;
        d.IsApproved = def.IsApproved;
        d.IsLocked = def.IsLocked;
        d.IsVisible = def.IsVisible;
        d.IsDeleted = def.IsDeleted;
        d.CreatedAt = def.CreatedAt;
        d.LastModifiedAt = def.LastModifiedAt;
        d.Current = def.Current;
        d.Versions = def.Versions ?? [];
        d.Contributors = def.Contributors ?? [];
        return d;
    }
}