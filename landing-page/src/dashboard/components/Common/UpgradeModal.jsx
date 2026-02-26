import { Lock, FileSpreadsheet, FileText, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const UpgradeModal = ({ isOpen, onClose, onUpgrade }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            {/* Modal Header & Icon */}
            <div className="text-center mb-8 relative">
                <div className="absolute top-0 right-0 p-1">
                    <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        Pro Only
                    </span>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-primary-500/30 transform -rotate-6">
                    <Lock className="w-8 h-8 text-white rotate-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                    Unlock Data Exports
                </h2>
                <p className="text-gray-500 dark:text-gray-300">
                    Take your data with you. CSV and PDF reporting are exclusive to FinTrack Pro members.
                </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-300/50 border border-gray-100 dark:border-dark-300">
                    <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-lg text-success-600 dark:text-success-400 shrink-0">
                        <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            CSV Data Exports
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Export your entire transaction history into cleanly formatted spreadsheets. Compatible with Excel, Google Sheets, and your accountant's tools.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-300/50 border border-gray-100 dark:border-dark-300">
                    <div className="p-2 bg-danger-100 dark:bg-danger-900/30 rounded-lg text-danger-600 dark:text-danger-400 shrink-0">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            PDF Polish Reports
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Generate beautiful, board-ready PDF reports of your spending trends, balances, and financial health instantly.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-300/50 border border-gray-100 dark:border-dark-300">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400 shrink-0">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            ...and everything else in Pro!
                        </h4>
                        <div className="flex items-center gap-1.5 mt-2">
                            <CheckCircle2 className="w-4 h-4 text-primary-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">Advanced Analytics</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <CheckCircle2 className="w-4 h-4 text-primary-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">Unlimited Shared Budgets</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
                <Button
                    className="w-full flex justify-between items-center group relative overflow-hidden"
                    variant="primary"
                    size="lg"
                    onClick={onUpgrade}
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="z-10 font-bold">Upgrade to Pro</span>
                    <span className="z-10 flex items-center gap-1 font-medium bg-black/10 px-3 py-1 rounded-full text-sm">
                        $9/mo <ChevronRight className="w-4 h-4" />
                    </span>
                </Button>
                <div className="text-center">
                    <button
                        onClick={onClose}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    >
                        Maybe later
                    </button>
                </div>
            </div>

        </Modal>
    );
};

export default UpgradeModal;
