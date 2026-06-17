"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    ArrowUpIcon,
    Paperclip,
    Scale,
    ShieldAlert,
    Home,
    Briefcase,
    FileText,
} from "lucide-react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // Temporarily shrink to get the right scrollHeight
            textarea.style.height = `${minHeight}px`;

            // Calculate new height
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        // Set initial height
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface VercelV0ChatProps {
    onSend: (message: string) => void;
    isLoading?: boolean;
    compact?: boolean;
}

export function VercelV0Chat({ onSend, isLoading, compact }: VercelV0ChatProps) {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    const handleSend = () => {
        if (value.trim() && !isLoading) {
            onSend(value);
            setValue("");
            adjustHeight(true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={cn("flex flex-col items-center w-full max-w-4xl mx-auto", compact ? "p-0" : "p-4 space-y-8")}>
            {!compact && (
                <h1 className="text-4xl font-bold text-gray-900 text-center mt-10">
                    What legal issue can I help you with?
                </h1>
            )}

            <div className="w-full relative group">
                {/* Light blue shader behind the text box */}
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 blur-2xl opacity-40 group-hover:opacity-60 transition duration-500 rounded-3xl pointer-events-none"></div>
                
                <div className="relative bg-white rounded-xl border border-blue-100 shadow-sm focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-300 transition-all">
                    <div className="overflow-y-auto">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Court Navigator about Pakistani law..."
                            className={cn(
                                "w-full px-4 py-3",
                                "resize-none",
                                "bg-transparent",
                                "border-none",
                                "text-gray-900 text-sm",
                                "focus:outline-none",
                                "focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-gray-400 placeholder:text-sm",
                                "min-h-[60px]"
                            )}
                            style={{
                                overflow: "hidden",
                            }}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="group p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <Paperclip className="w-4 h-4 text-gray-500" />
                                <span className="text-xs text-gray-500 hidden group-hover:inline transition-opacity">
                                    Attach Document
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="px-2 py-1 rounded-lg text-sm text-gray-500 transition-colors border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-between gap-1"
                            >
                                <Scale className="w-4 h-4" />
                                Case File
                            </button>
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!value.trim() || isLoading}
                                className={cn(
                                    "px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-gray-300 flex items-center justify-between gap-1",
                                    value.trim() && !isLoading
                                        ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                                        : "text-gray-400 bg-gray-100 opacity-50 cursor-not-allowed"
                                )}
                            >
                                <ArrowUpIcon
                                    className={cn(
                                        "w-4 h-4",
                                        value.trim() && !isLoading
                                            ? "text-white"
                                            : "text-gray-400"
                                    )}
                                />
                                <span className="sr-only">Send</span>
                            </button>
                        </div>
                    </div>
                </div>

                {!compact && (
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                        <ActionButton
                            icon={<ShieldAlert className="w-4 h-4" />}
                            label="Punishment for theft"
                            onClick={() => onSend("What is the punishment for theft in Pakistan?")}
                        />
                        <ActionButton
                            icon={<Home className="w-4 h-4" />}
                            label="Deposit not returned"
                            onClick={() => onSend("My landlord won't return my deposit, what can I do?")}
                        />
                        <ActionButton
                            icon={<Briefcase className="w-4 h-4" />}
                            label="Wrongful termination"
                            onClick={() => onSend("What are my rights if I am wrongfully terminated from my job?")}
                        />
                        <ActionButton
                            icon={<FileText className="w-4 h-4" />}
                            label="How to file an FIR"
                            onClick={() => onSend("How to file an FIR in Pakistan?")}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-full border border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm transition-colors"
        >
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
}
