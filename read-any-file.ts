import * as flatbuffers from "./flatbuffers.ts";
import * as msg from "./msg_generated.ts";
import { assert } from "./util.ts";
import * as util from "./util.ts";
import { TextDecoder } from "./text_encoding.ts";
import { sendSync } from "./dispatch.ts";


const decoder = new TextDecoder();

interface ResponseModuleMetaData {
    moduleName: string | undefined;
    filename: string | undefined;
    mediaType: msg.MediaType;
    sourceCode: string | undefined;
}
  

// @internal
export function fetchModuleMetaData(
        specifier: string,
        referrer: string
    ): ResponseModuleMetaData {
        util.log("os.fetchModuleMetaData", { specifier, referrer });
        // Send FetchModuleMetaData message
        const builder = flatbuffers.createBuilder();
        const specifier_ = builder.createString(specifier);
        const referrer_ = builder.createString(referrer);
        msg.FetchModuleMetaData.startFetchModuleMetaData(builder);
        msg.FetchModuleMetaData.addSpecifier(builder, specifier_);
        msg.FetchModuleMetaData.addReferrer(builder, referrer_);
        const inner = msg.FetchModuleMetaData.endFetchModuleMetaData(builder);
        const baseRes = sendSync(builder, msg.Any.FetchModuleMetaData, inner);
        assert(baseRes != null);
        assert(
        msg.Any.FetchModuleMetaDataRes === baseRes!.innerType(),
        `base.innerType() unexpectedly is ${baseRes!.innerType()}`
        );
        const fetchModuleMetaDataRes = new msg.FetchModuleMetaDataRes();
        assert(baseRes!.inner(fetchModuleMetaDataRes) != null);
        const dataArray = fetchModuleMetaDataRes.dataArray();
        const sourceCode = dataArray ? decoder.decode(dataArray) : undefined;
        // flatbuffers returns `null` for an empty value, this does not fit well with
        // idiomatic TypeScript under strict null checks, so converting to `undefined`
        return {
        moduleName: fetchModuleMetaDataRes.moduleName() || undefined,
        filename: fetchModuleMetaDataRes.filename() || undefined,
        mediaType: fetchModuleMetaDataRes.mediaType(),
        sourceCode
        };
}

async function cat(filenames: string[]): Promise<void> {
    for (let filename of filenames) {
        console.log(fetchModuleMetaData(filename, ".").sourceCode);
    }
}
  
cat(Deno.args.slice(1));
