export namespace main {
	
	export class Config {
	    read_steam_path: boolean;
	    download_path: string;
	    add_dlc: boolean;
	    set_manifestid: boolean;
	    github_token: string;
	    library_choice: string;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.read_steam_path = source["read_steam_path"];
	        this.download_path = source["download_path"];
	        this.add_dlc = source["add_dlc"];
	        this.set_manifestid = source["set_manifestid"];
	        this.github_token = source["github_token"];
	        this.library_choice = source["library_choice"];
	    }
	}

}

