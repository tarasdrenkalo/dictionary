export interface VersionedDefinition {
    VersionNumber:number;
    Creator:string|null;
    Content:string|HTMLElement;
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
    Contributors:Set<string>;
}
export interface DefinitionConstructiorOptions {
    versioning:number;
    content:string|HTMLElement;
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
    Contributors: Set<string>;
    constructor(options:DefinitionConstructiorOptions) {
        this.IsApproved = false;
        this.id = crypto.randomUUID();
        const current:VersionedDefinition = {
            Content: options.content,
            id:crypto.randomUUID(),
            Creator: options.creator,
            Sources: options.sources,
            VersionNumber: options.versioning,
        }
        this.Contributors = new Set();
        this.Contributors.add(options.creator);
        this.Current = current;
        this.Versions = [];
        this.Versions.push(current);
        this.CreatedAt = options.createdat;
        this.LastModifiedAt = options.lastmodified;
        this.IsLocked = false;
        this.IsVisible = false;
        this.IsDeleted = false;
    }
    Edit(content:string|HTMLElement,by:string, sources:string[]) {
        const current:VersionedDefinition = {
            Content: content,
            Creator: by,
            VersionNumber: (this.Versions?.length || 0) + 1,
            Sources: sources,
            id: crypto.randomUUID(),
        }
        this.Versions.push(current);
        this.Current = current;
        this.Contributors.add(by);
        return this;
    }
    Delete(version:number|string) {
        let target:VersionedDefinition|undefined;
        switch(typeof version) {
            case "string":
                target = this.Versions?.filter((vd)=>vd.id == version)[0];
                if(typeof target === undefined) throw "Version not found!";
                if(target === this.Current) throw "Can not remove current!";
                this.Versions = this.Versions.filter((vd)=>vd.id != version);
                break;
            case "number":
                target = this.Versions?.filter((vd)=>vd.VersionNumber == version)[0];
                if(typeof target === undefined) throw "Version not found!";
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
            IsApproved: this.IsLocked,
            IsVisible: this.IsVisible,
            IsDeleted: this.IsDeleted,
            CreatedAt: this.CreatedAt,
            LastModifiedAt: this.LastModifiedAt,
            Contributors: this.Contributors
        };
    };
}