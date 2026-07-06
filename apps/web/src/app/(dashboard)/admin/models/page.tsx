'use client';

interface Model {
  id: string;
  name: string;
  version: string;
  type: string;
  status: string;
  accuracy: string;
  latency: string;
  deployed: string;
}

const MOCK_MODELS: Model[] = [
  { id: '1', name: 'Gesture Classifier', version: 'v2.1.0', type: 'ONNX', status: 'Production', accuracy: '94.2%', latency: '42ms', deployed: '2 days ago' },
  { id: '2', name: 'Sequence Recognizer', version: 'v1.3.0', type: 'PyTorch', status: 'Production', accuracy: '88.7%', latency: '156ms', deployed: '5 days ago' },
  { id: '3', name: 'Face Mesh', version: 'v1.0.0', type: 'MediaPipe', status: 'Staging', accuracy: '96.1%', latency: '18ms', deployed: '1 week ago' },
  { id: '4', name: 'Translator EN→AR', version: 'v3.0.0', type: 'ONNX', status: 'Production', accuracy: '91.5%', latency: '89ms', deployed: '3 days ago' },
  { id: '5', name: 'Speech Recognizer', version: 'v1.1.0', type: 'Whisper', status: 'Development', accuracy: '87.3%', latency: '320ms', deployed: '—' },
];

export default function AdminModelsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Models</h1>
          <p className="text-sm text-gray-500">AI model registry and deployment management</p>
        </div>
        <button className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors">
          + Deploy Model
        </button>
      </div>

      {/* Environment Badge */}
      <div className="flex gap-2">
        {['All', 'Production', 'Staging', 'Development'].map((env) => (
          <button
            key={env}
            className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${
              env === 'All' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {env}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_MODELS.map((model) => (
          <div key={model.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{model.name}</h3>
                <p className="text-xs text-gray-500">{model.version} · {model.type}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                model.status === 'Production' ? 'bg-green-100 text-green-700' :
                model.status === 'Staging' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {model.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Accuracy</span>
                <span className="font-medium text-gray-900">{model.accuracy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Latency</span>
                <span className="font-medium text-gray-900">{model.latency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Deployed</span>
                <span className="text-gray-700">{model.deployed}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Rollback
              </button>
              <button className="flex-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 transition-colors">
                Deploy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
