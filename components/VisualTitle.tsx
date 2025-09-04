export default function DispPageTitle({ title }: { title: string }) {
    return (
        <div className="w-5/6 border-border border-l border-r">

            <div className="font-logo text-border text-2xl w-full flex flex-row  border-border border-t border-b mt-5 mb-5 overflow-hidden">
                <div className="marq  min-w-full flex flex-row justify-around">
                    <p>{title}</p>
                    <p>{title}</p>
                    <p>{title}</p>
                    <p>{title}</p>
                    <p>{title}</p>
                    <p>{title}</p>
                    <p>{title}</p>
                    <p>{title}</p>
                    
                </div>
                <div className="marq  min-w-full flex flex-row justify-around">
                    <p>{title}</p>
                    <p>{title}</p>
                    <p>{title}</p>
                    <p>{title}</p>
                    <p>{title}</p>
                    <p>{title}</p>
                    <p>{title}</p>
                    <p>{title}</p>
                    
                </div>
                
            </div>
        </div>

    );
}