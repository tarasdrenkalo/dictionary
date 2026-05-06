import {i18n} from "@dictionary/i18n";
export interface VersionedDefinition {
    Version:string;
    Creator:string;
    Content:i18n<string>;
    Sources:Array<string>;
    Date:number;
}
export interface Definition {
    ID:string;
    Versions:Array<VersionedDefinition>;
    Current:VersionedDefinition;
    IsLocked:boolean;
    IsApproved:boolean;
    IsVisible:boolean;
    IsDeleted:boolean;
    CreatedAt:number;
    LastModifiedAt:number;
    Contributors:Array<string>;
}
export interface DefinitionConstructorOptions {
    content:i18n<string>;
    sources:Array<string>;
    creator:string;
}
export class DefinitionInstance implements Definition {
    ID: string;
    IsApproved: boolean;
    Versions: VersionedDefinition[];
    Current: VersionedDefinition;
    IsLocked: boolean;
    IsVisible: boolean;
    IsDeleted: boolean;
    CreatedAt: number;
    LastModifiedAt: number;
    Contributors: Array<string>;
    constructor(options:DefinitionConstructorOptions) {
        this.IsApproved = false;
        this.ID = crypto.randomUUID();
        const current:VersionedDefinition = {
            Content: options?.content,
            Version:crypto.randomUUID(),
            Date:Date.now(),
            Creator: options.creator,
            Sources: options.sources,
        }
        this.Contributors = [];
        this.Contributors.push(options.creator);
        this.Current = current;
        this.Versions = [];
        this.Versions.push(current);
        this.CreatedAt = Date.now();
        this.LastModifiedAt = Date.now();
        this.IsLocked = false;
        this.IsVisible = false;
        this.IsDeleted = false;
    }
    Edit(content:string,by:string, sources:string[]) {
        const current:VersionedDefinition = {
            Content: {English:content},
            Creator: by,
            Version: crypto.randomUUID(),
            Sources: sources,
            Date:Date.now()
        }
        this.Versions.push(current);
        this.Current = current;
        this.Contributors.push(by);
        this.LastModifiedAt = Date.now()
        return this;
    }
    Delete(version:string) {
        let target = this.Versions?.filter((vd)=>vd.Version == version)[0];;
        if(typeof target === "undefined") return this;
        if(target === this.Current) throw "Can not remove current!";
        this.Versions = this.Versions.filter((vd)=>vd.Version != version);
        return this;
    }
    Lock = ()=>{ this.IsLocked = true; return this;}
    Unlock = ()=>{this.IsLocked = false; return this;}
    Show = ()=>{ this.IsVisible = true; return this;}
    Hide = ()=>{this.IsVisible = false;return this;}
    ToJSON(): Definition {
        return {
            ID: this.ID,
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
    static FromJSON(def: Definition): Definition {
        const d = Object.create(DefinitionInstance.prototype) as DefinitionInstance;
        d.ID = def.ID;
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